import * as fs from "fs-extra";
import {ITemplateData} from "./templateProcessor";
import {resolve} from "path";
import {join} from "path";

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

	static getTemplateDescriptor(id: string){

		const fileContents = fs.readFileSync(resolve(this.templateDir, id, "tstemplate.json"), "utf-8");

		let templateDef = JSON.parse(fileContents) as ITemplateData;

		if (!templateDef)
			throw new Error("Could not resolve template");

		return templateDef;
	}

	static copyTemplate(id: string, dest: string){
		fs.copySync(resolve(this.templateDir, id), dest, { recursive: true });
	}
}
