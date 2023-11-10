import {CliUx, Command, Flags} from '@oclif/core'
import {Templates} from "../create/template";
import {ITemplateData, ITemplateFields, TemplateProcessor} from "../create/templateProcessor";
import * as fs from "fs-extra";
import inquirer from "inquirer";
import {resolve, join} from "path";
import exec from "child_process";

export default class Create extends Command {

	static description = 'Create a new TokenScript project';

	private dir: string = ".";

	static flags = {
		// can pass either --force or -f
		template: Flags.string({char: "t", options: Templates.templatesList.map((template) => template.id)}),
	}

	static args = [
		{name: 'directory', default: process.cwd()}
	]

	async catch(error: Error) {
		// do something or
		// re-throw to be handled globally
		throw error;
	}

	async run(): Promise<void> {
		const {flags, args} = await this.parse(Create);

		this.dir = args.directory.indexOf("/") !== 0 ? resolve(process.cwd(), args.directory) : args.directory;

		if (fs.existsSync(this.dir)){

			let numFiles = fs.readdirSync(this.dir).length;

			if (numFiles && fs.existsSync(join(this.dir, "tstemplate.json"))){
				await this.handleExistingProject();
				return;
			}

		} else {
			let proceed = await CliUx.ux.confirm("Create new workspace at " + this.dir + "?");

			if (!proceed){
				return;
			}

			fs.mkdirSync(this.dir, { recursive: true });
		}

		let template = flags.template as string;
		if (!template)
			template = await this.showTemplateSelection();

		let templateDef = Templates.getTemplateDescriptor(template);

		let values = await this.collectFieldValues(templateDef.templateFields);

		CliUx.ux.action.start("Initializing template...");

		Templates.copyTemplate(template, this.dir);

		await this.processTemplateUpdate(templateDef, values);

		CliUx.ux.action.stop();

		// If this is a node-based project, run "npm i" to install dependencies
		if (fs.existsSync(join(this.dir, "package.json"))){
			try {
				CliUx.ux.action.start("Running NPM install...");
				exec.execSync("cd " + this.dir + " && npm i");
			} catch (e: any){
				CliUx.ux.error(e);
				CliUx.ux.info("Failed to run 'npm i', please perform this step manually");
			}
		}

		CliUx.ux.action.stop();
		CliUx.ux.info("Project successfully initialized!\r\n");
	}

	private async processTemplateUpdate(templateDef: ITemplateData, values: any[]){

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

	private async showTemplateSelection(){

		let template;

		while (!template){

			let responses: any = await inquirer.prompt([{
				name: 'template',
				message: 'Select project template',
				type: 'list',
				choices: Templates.templatesList.map((template) => {
					return { name:  template.name + ": " + template.description, value: template.id}
				}),
			}]);

			template = responses.template;

			if (!template)
				console.log("\r\nInvalid selection!\r\n");
		}

		return template;
	}

	private async collectFieldValues(templateDef: ITemplateFields[]){

		let responses: any = await inquirer.prompt(templateDef.map((fieldDef) => {
			return {
				name: fieldDef.name,
				message: fieldDef.prompt + ":",
				type: "input",
				validate: (val) => {
					return val != "";
				}
			};
		}));

		let values: any[] = [];

		for (let i = 0; i < templateDef.length; i++){
			let value = responses[templateDef[i].name];

			if (value == undefined)
				throw new Error("Value not provided");

			values.push(responses[templateDef[i].name]);
		}

		return values;
	}
}
