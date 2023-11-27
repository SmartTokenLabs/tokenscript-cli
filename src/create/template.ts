import * as fs from "fs-extra";
import { resolve } from "path";
import { join } from "path";
import { ITemplateData } from "../create/templateProcessor";

export interface ITemplateListItem {
	id: string;
	name: string;
	description: string;
	location: string;
}

export class Templates {

	static DEV_PATH = join(__dirname, "..", "..", "static/templates");
	static PROD_PATH = join(__dirname, "..", "templates");

	static templateDir = fs.existsSync(Templates.DEV_PATH) ? Templates.DEV_PATH : Templates.PROD_PATH;

	// Used for replacing ACTION_NAME in card templates
	static cardTemplate: ITemplateData = {
		name: "",
		description: "",
		templateFields: [
			{
				name: "Card Name",
				token: "ACTION_NAME",
				prompt: ""
			}
		]
	}

	static templatesList: ITemplateListItem[] = [
		{
			id: "emptySvelte",
			name: "Empty Svelte Project",
			description: "An empty TokenScript project with Svelte & Vite",
			location: "templates/emptySvelte"
		},
		{
			id: "emptyTypescript",
			name: "Empty TypeScript Project",
			description: "An empty TokenScript project with TypeScript & Webpack",
			location: "templates/emptyTypescript"
		},
		{
			id: "empty",
			name: "Empty Project",
			description: "An empty TokenScript project",
			location: "templates/empty"
		},
		/*{
			id: "entryToken",
			name: "Entry Token",
			description: "An example of using TokenScript to interact with ioT devices",
			location: "templates/entryToken"
		}*/
	];

	static getTemplateDescriptor(id: string) {

		const fileContents = fs.readFileSync(resolve(this.templateDir, id, "tstemplate.json"), "utf-8");

		let templateDef = JSON.parse(fileContents) as ITemplateData;

		if (!templateDef)
			throw new Error("Could not resolve template");

		return templateDef;
	}

	static getCardTemplate(): ITemplateData {

		return Templates.cardTemplate;
	}

	static copyTemplate(id: string, dest: string) {
		fs.copySync(resolve(this.templateDir, id), dest, { recursive: true });
	}

	static initTemplate(dest: string, template: string) {
		let files: string[] = fs.readdirSync(dest);

		for (let fileName of files) {
			if (fileName.endsWith("html")) {
				fs.rmSync(fileName);
			}
		}

		if (fs.existsSync(join(dest, "tokenscript.xml"))) {
			fs.rmSync(join(dest, "tokenscript.xml"));
		}

		fs.rmSync(join(dest, "tstemplate.json"));
		fs.copyFileSync(resolve(this.templateDir, template, "tstemplate.json"), join(dest, "tstemplate.json"));

		this.copyHHInit(dest);
	}

	static copyHHInit(dest: string) {
		const files = fs.readdirSync(join(this.templateDir, "hardhat")).filter(fileName => fileName.endsWith('.html'));
		files.push("tokenscript.xml");
		for (const file of files) {
			fs.copyFileSync(resolve(this.templateDir, "hardhat", file), join(dest, file));
		}
	}

	static cleanBuildFiles(dest: string) {
		//remove prep files
		if (fs.existsSync(join(dest, "non-payable-card.html"))) {
			fs.rmSync(join(dest, "non-payable-card.html"));
			fs.rmSync(join(dest, "payable-card.html"));
		}
	}
}
