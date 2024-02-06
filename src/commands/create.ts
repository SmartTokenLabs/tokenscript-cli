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
		console.log(`Error: ${error.message}`);
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
				await this.handleExistingProject(hardHat);
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
			CliUx.ux.info("Project generation complete!\r\n");
		} else if (JSON.stringify(contractABI).length > 2) { // Generate from ABI
			await abiEncoder.start(contractABI, "Token");
			CliUx.ux.info("Project generation complete!\r\n");
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

	private async handleExistingProject(hardHat: string) {

		let templateDef = fs.readJsonSync(this.dir + "/tstemplate.json");

		if (!templateDef)
			throw new Error("Template file is invalid or not readable");

		CliUx.ux.info("Existing workspace detected.");

		const newCard = "New Card";
		const refreshProject = "Refresh Project";

		let addNewCard = await inquirer.prompt([{
            name: 'addCard',
            message: `Generate new card(s) or refresh project?`,
            type: 'list',
            choices: [newCard, refreshProject, 'abort']
        }]);

		let proceed = addNewCard.addCard;

		if (proceed === newCard) {
			console.log("Doing new card");
			let templateProcessor = new TemplateProcessor(templateDef, this.dir);
			let values = templateProcessor.getValuesFromTSTemplate();
			//add new card from etherscan ABI update
			let contract = await this.updateCard(values, templateDef);
			//now process the data
			await this.handleTSUpdate(values, templateDef, contract, hardHat);
		} else if (proceed === refreshProject) {
			//refresh
			let values = await this.collectFieldValues(templateDef.templateFields);
			await this.processTemplateUpdate(templateDef, values);
		} else {
			return;
		}
	}

	private async updateCard(values: any, templateDef: any): Promise<ContractLocator> {
		//ask user for new contract address
		let tokenAddress = this.getContract(values, templateDef);
		let tokenName = tokenAddress.name;

		const useTokenAddress: any = await inquirer.prompt([{
			name: 'useContract',
			message: 'From which contract do you want to pull the new functions / attributes?',
			default: `${tokenAddress.address}`, 
		  }]);

		const inputChainId: any = await inquirer.prompt([{
			name: 'useChainId',
			message: 'From which chainId?',
			default: `${tokenAddress.chainId}`, 
		  }]);

		if (tokenAddress.address !== useTokenAddress.useContract || tokenAddress.chainId !== inputChainId.useChainId) {
			const newTokenName: any = await inquirer.prompt([{
				name: 'tokenName',
				message: `Name this contract (used within the TokenScript, must be different from '${tokenAddress.name}')`,
				default: `${tokenAddress.name}_1`,
		  	}]);

			let selectedName = newTokenName.tokenName;
			if (selectedName == tokenName) {
				CliUx.ux.error("Additional contracts cannot have the same name as the origin token."); //abort
			} else {
				tokenName = selectedName;
			}
		}

		tokenAddress = { chainId: inputChainId.useChainId, address: useTokenAddress.useContract, name: tokenName };

		return tokenAddress;
	}

	private async handleTSUpdate(values: any, templateDef: any, tokenAddress: ContractLocator, hardHat: string) {
		//1. Add template files
		Templates.copyCards(this.dir);
		//1. Pull ABI for contract
		CliUx.ux.action.start("Fetching ABI from Block Scanner...");
		let abiEncoder: ABIToScript = new ABIToScript(this.dir, tokenAddress);
		const logicAddress = await abiEncoder.getLogicAddress(tokenAddress);
		let contractABIResponse = await abiEncoder.getABI({chainId: tokenAddress.chainId, address: logicAddress, name: tokenAddress.name});
		let contractABI = abiEncoder.convertABI(contractABIResponse);
		CliUx.ux.action.stop();
		if (JSON.stringify(contractABI).length <= 3) {
			CliUx.ux.error("Failed to fetch contract ABI. Unable to proceed. This may be due to rate limits in bundled Etherscan key - please try again later or add your Etherscan API key to the .env file");
		}

		//hardHat?

		//2. ask for new attrs/functions and add in new cards/scripts and additional contracts
		await abiEncoder.startUpdate(contractABI);

		//3. cleanup
		Templates.cleanBuildFiles(this.dir);

		CliUx.ux.info("Project update complete!\r\n");
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

