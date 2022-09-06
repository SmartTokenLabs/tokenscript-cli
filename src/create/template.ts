import * as fs from "fs";
import {ITemplateData} from "./templateProcessor";

export interface ITemplateListItem {
	id: string;
	name: string;
	description: string;
	location: string;
}

export class Templates {

	static templateDir = __dirname + "/templates/";

	static templatesList: ITemplateListItem[] = [
		{
			id: "empty",
			name: "Empty Project",
			description: "An empty TokenScript project",
			location: "templates/empty"
		},
		{
			id: "entryToken",
			name: "Entry Token",
			description: "An example of using TokenScript to interact with ioT devices",
			location: "templates/entryToken"
		}
	];

	static getTemplateDescriptor(id: string){

		const fileContents = fs.readFileSync(this.templateDir + id + "/tstemplate.json", "utf-8");

		return JSON.parse(fileContents) as ITemplateData;
	}

	static copyTemplate(id: string, dest: string){

	}
}
