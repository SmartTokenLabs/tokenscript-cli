import {CliUx, Command, Flags} from '@oclif/core'
import {Templates} from "../create/template";
import {ITemplateData} from "../create/templateProcessor";
import * as fs from "fs";
import inquirer from "inquirer";

export default class Create extends Command {

	static description = 'Create a new TokenScript project';

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

		let template = flags.template as string;

		if (!template){

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
		}

		console.log("\r\nTemplate chosen: " + template);

		let dir = args.directory.indexOf("/") !== 0 ? process.cwd() + "/" + args.directory : args.directory;

		console.log("\r\nDirectory: " + dir);

		let templateDef = Templates.getTemplateDescriptor(template);

		console.log(templateDef);

		// TODO: Check project workspace is empty
		if (fs.existsSync(dir)){

			let numFiles = fs.readdirSync(dir).length;

			if (numFiles){
				// TODO: Overwrite warning

			}

		} else {
			let proceed = await CliUx.ux.confirm("Create new workspace at " + dir + "?");

			if (proceed){
				return;
			}
		}

		// TODO: Ask questions in template

		// TODO: Copy template content into workspace

		// TODO: Load template config file

		// TODO: Replace tokens in project using template processor
	}

	private collectFieldValues(templateDef: ITemplateData){

		for (let fieldDef of templateDef.templateFields){



		}
	}
}
