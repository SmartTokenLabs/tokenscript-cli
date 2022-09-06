import {replaceInFile} from "replace-in-file";
import * as fs from "fs";

export interface ITemplateFields {
	name: string;
	token: string;
	prompt: string;
	value: string;
}

export interface ITemplateData {
	name: string;
	description: string;
	templateFields: ITemplateFields[];
}

export class TemplateProcessor {

	constructor(
		private templateData: ITemplateData,
		private workspace: string
	) {

	}

	async processTemplateUpdate(values: any[]){

		if (this.templateData.templateFields.length != values.length)
			throw new Error("Template values length must match field length");

		const results = await replaceInFile({
			files: [
				this.workspace + "/*.xml",
				this.workspace + "/*.shtml"
			],
			from: this.templateData.templateFields.map((field) => {
				return field.value ?? new RegExp("\\\$\\\{" + field.token + "\\\}", 'g');
			}),
			to: values
		});

		let replacements = results.reduce((count, currentValue) => {
			return count + (currentValue.hasChanged ? 1 : 0);
		}, 0);

		if (!replacements){
			console.log("Nothing was updated in the project");
			return;
		}

		for (let i = 0; i < values.length; i++){
			this.templateData.templateFields[i].value = values[i];
		}

		fs.writeFileSync(this.workspace + "/tstemplate.json", JSON.stringify(this.templateData, null, "\t"));
	}
}
