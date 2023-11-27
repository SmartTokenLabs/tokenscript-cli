import { CliUx, Command, Flags } from '@oclif/core'
import { Templates } from "../create/template";
import { ITemplateData, ITemplateFields, TemplateProcessor } from "../create/templateProcessor";
import * as fs from "fs-extra";
import inquirer from "inquirer";
import { resolve, join } from "path";
import exec from "child_process";
import ABIToScript from '../create/abiToScript';

export interface ContractLocator {
	chainId: number;
	address: string;
	name: string;
}

const Types = {
	FUNCTION: "function",
	TUPLE: "tuple",
	EVENT: "event"
};

const FunctionTypes = {
	NON_PAYABLE: "nonpayable",
	VIEW: "view",
	PURE: "pure",
	PAYABLE: "payable"
};

export default class Create extends Command {

	static description = 'Create a new TokenScript project';

	private dir: string = ".";

	static SRC_XML_FILE = "tokenscript.xml";

	static hardHatTemplate: string = "hardhat";

	static flags = {
		// can pass either --force or -f
		template: Flags.string({ char: "t", options: Templates.templatesList.map((template) => template.id) }),
		hardHat: Flags.string({ char: "h", description: 'Directory of HardHat project' }), //TODO: Ask user for HardHat directory if not given
	}

	static args = [
		{ name: 'directory', default: process.cwd() }
	]

	async catch(error: Error) {
		// do something or
		// re-throw to be handled globally
		throw error;
	}

	async run(): Promise<void> {

		const { flags, args } = await this.parse(Create);

		this.dir = args.directory.indexOf("/") !== 0 ? resolve(process.cwd(), args.directory) : args.directory;

		let hardHat = flags.hardHat as string;
		let template = flags.template as string;

		if (fs.existsSync(this.dir)) {

			let numFiles = fs.readdirSync(this.dir).length;

			if (numFiles && fs.existsSync(join(this.dir, "tstemplate.json"))) {
				await this.handleExistingProject();
				return;
			}

		} else {
			let proceed = await CliUx.ux.confirm("Create new workspace at " + this.dir + "?");

			if (!proceed) {
				return;
			}

			fs.mkdirSync(this.dir, { recursive: true });
		}

		if (hardHat) {
			template = Create.hardHatTemplate;
		}
		else if (!template) {
			template = await this.showTemplateSelection();
		}

		let templateDef = Templates.getTemplateDescriptor(template);

		let values = await this.collectFieldValues(templateDef.templateFields);

		let tokenAddress = this.getContract(values, templateDef);
		let contractABI: any;

		let abiEncoder: ABIToScript = new ABIToScript(this.dir, tokenAddress);

		// If user selected 'Fetch ABI' then attempt to fetch contractABI from etherscan etc
		if (abiEncoder.getABIFetchOption(templateDef.templateFields, values)) {
			CliUx.ux.action.start("Fetching ABI from Block Scanner...");
			[contractABI, template] = await this.checkFetchABI(template, tokenAddress);
			if (JSON.stringify(contractABI).length <= 2) {
				CliUx.ux.info("Failed to fetch contract ABI. Generating standard default TokenScript.");
			}
			CliUx.ux.action.stop();
		}

		CliUx.ux.action.start("Initializing template...");

		Templates.copyTemplate(template, this.dir);

		await this.processTemplateUpdate(templateDef, values);

		CliUx.ux.action.stop();

		// If this is a node-based project, run "npm i" to install dependencies
		if (fs.existsSync(join(this.dir, "package.json"))) {
			try {
				CliUx.ux.action.start("Running NPM install...");
				exec.execSync("cd " + this.dir + " && npm i");
			} catch (e: any) {
				CliUx.ux.error(e);
				CliUx.ux.info("Failed to run 'npm i', please perform this step manually");
			}
		}

		CliUx.ux.action.stop();
		CliUx.ux.info("Project successfully initialized!\r\n");
		await this.handleABItoScript(hardHat, templateDef, contractABI, tokenAddress);
		Templates.cleanBuildFiles(this.dir);
	}

	private async checkFetchABI(template: string, tokenAddress: ContractLocator): Promise<[any, string]> {
		// pull contract address and chain
		let abiEncoder: ABIToScript = new ABIToScript(this.dir, tokenAddress);
		tokenAddress.address = await abiEncoder.getLogicAddress(tokenAddress);
		let contractABIResponse = await abiEncoder.getABI(tokenAddress);
		let contractABI = abiEncoder.convertABI(contractABIResponse);
		if (JSON.stringify(contractABI).length > 2) {
			// handle ABI from block scan
			template = Create.hardHatTemplate;
		} 

		return [contractABI, template];
	}

	private async handleABItoScript(hardHat: string, templateDef: ITemplateData, contractABI: any, tokenAddress: ContractLocator) {
		let abiEncoder: ABIToScript = new ABIToScript(this.dir, tokenAddress);
		if (hardHat) {

			if (!fs.existsSync(join(hardHat, "hardhat.config.ts"))) {
				CliUx.ux.error("-h <directory> must point to HardHat project");
			}
	
			if (!fs.existsSync(join(hardHat, "artifacts", "contracts"))) {
				CliUx.ux.error("linked HardHat project must be built");
			}

			let filesToHandle: string[] = [];
			let contractABIs: string[] = fs.readdirSync(join(hardHat, "artifacts", "contracts"));

			// Don't ask user if there's only one contract
			if (contractABIs.length > 1) {

				let selection: any[] = [];
				for (let thisFile of contractABIs) {
					selection.push({ name: thisFile, value: thisFile });
				}

				const fileChoice = await inquirer.prompt([{
					name: 'fileSelection',
					message: `Add which files to TokenScript?`,
					type: 'checkbox',
					choices: selection,
				}]);

				filesToHandle = fileChoice.fileSelection;
			} else {
				filesToHandle.push(contractABIs[0]);
			}

			await abiEncoder.initFromHardHat(hardHat, filesToHandle);
			let templateProcessor = new TemplateProcessor(templateDef, this.dir);
			await templateProcessor.updateHardHat(hardHat);
		} else if (JSON.stringify(contractABI).length > 2) { // Generate from ABI
			await abiEncoder.start(contractABI, "Token");
		}
	}

	getContract(values: any[], templateDef: ITemplateData): ContractLocator {
		const addressIndex = templateDef.templateFields.findIndex((element) => element.token === 'CONTRACT_ADDRESS');
		const chainIndex = templateDef.templateFields.findIndex((element) => element.token === 'CONTRACT_CHAIN');
		const nameIndex = templateDef.templateFields.findIndex((element) => element.token === 'TOKENSCRIPT_NAME');

		const addressVal = values[addressIndex];
		const chainIdVal = values[chainIndex];
		const nameVal = values[nameIndex];

		const tokenAddress: ContractLocator = { chainId: chainIdVal, address: addressVal, name: nameVal };

		return tokenAddress;
	}

	private async processTemplateUpdate(templateDef: ITemplateData, values: any[]) {

		let templateProcessor = new TemplateProcessor(templateDef, this.dir);

		await templateProcessor.processTemplateUpdate(values);
	}

	private async handleExistingProject() {

		let templateDef = fs.readJsonSync(this.dir + "/tstemplate.json");

		if (!templateDef)
			throw new Error("Template file is invalid or not readable");

		let proceed = await CliUx.ux.confirm("Existing workspace detected, would you like to try and update template values?\r\nThis may not work correctly, please save your current workspace before continuing");

		if (!proceed)
			return;

		let values = await this.collectFieldValues(templateDef.templateFields);

		await this.processTemplateUpdate(templateDef, values);
	}

	private async showTemplateSelection() {

		let template;

		while (!template) {

			let responses: any = await inquirer.prompt([{
				name: 'template',
				message: 'Select project template',
				type: 'list',
				choices: Templates.templatesList.map((template) => {
					return { name: template.name + ": " + template.description, value: template.id }
				}),
			}]);

			template = responses.template;

			if (!template)
				console.log("\r\nInvalid selection!\r\n");
		}

		return template;
	}

	private async collectFieldValues(templateDef: ITemplateFields[]) {

		let responses: any = await inquirer.prompt(templateDef.map((fieldDef) => {

			const type = fieldDef.options?.length ? "list" : "input";
			const choices = fieldDef.options?.length ? fieldDef.options.map((option) => {
				return { name: option, value: option };
			}) : undefined;

			return {
				name: fieldDef.name,
				message: fieldDef.prompt + ":",
				type,
				choices,
				validate: (val) => {
					return val != "";
				}
			};
		}));

		let values: any[] = [];

		for (let i = 0; i < templateDef.length; i++) {
			let value = responses[templateDef[i].name];

			if (value == undefined)
				throw new Error("Value not provided");

			values.push(responses[templateDef[i].name]);
		}

		return values;
	}
}

