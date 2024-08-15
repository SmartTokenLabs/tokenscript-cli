import {replaceInFile} from "replace-in-file";
import * as fs from "fs";
import {join} from "path";
import {ProjectContext} from "../projectContext";

export interface ITemplateFields {
	name: string;
	token: string;
	updatePrefix?: string;
	prompt: string;
	options?: string[];
	value?: string;
	isEnvironment?: boolean;
}

export interface ITemplateData {
	name: string;
	description: string;
	hardhat?: any[];
	templateFields: ITemplateFields[];
}


export class TemplateProcessor extends ProjectContext {

	constructor(
		private templateData: ITemplateData,
		workspace: string
	) {
		super(workspace);
	}

	async processTemplateUpdate(values: any[]) {

		if (this.templateData.templateFields.length != values.length)
			throw new Error("Template values length must match field length");

		// Add trimmed name into replacement template
		values = this.insertTrimmedName(values);

		// TODO: Add src & JS files?
		const results = await this.replaceInFiles(values, ["*.xml", "*.html"]);

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

		fs.writeFileSync(join(this.workspace, "tstemplate.json"), JSON.stringify(this.templateData, null, "\t"));

		// Create project file with environment config and other settings
		const projectFile = this.getProjectSettings();

		// Update environment variables
		this.templateData.templateFields.forEach((field, index) => {
			if (!field.isEnvironment)
				return;
			projectFile.environment.default[field.token] = values[index];
		})

		this.setProjectSettings(projectFile);
		this.saveProjectSettings();
	}

	async updateHardHat(file: string) {

		let hardhatRelPath = { directory: join(this.workspace, file) };
		this.templateData.hardhat?.push(hardhatRelPath);
		fs.writeFileSync(join(this.workspace, "tstemplate.json"), JSON.stringify(this.templateData, null, "\t"));
	}

	getHardHatDirectory(): string {
		var dir: string = "";
		for (let element of this.templateData.hardhat!) {
			if ('directory' in element) {
				dir = element.directory;
				break;
			}
		}
		return dir;
	}

	async replaceInFiles(values: any[], fileNames: string[]) {
		let filesForReplace: string[] = [];
		for(let file of fileNames) {
			filesForReplace.push(join(this.workspace, file));
		}

		const nonEnvironmentValues: any[] = [];
		const nonEnvironmentFields = this.templateData.templateFields.filter((field, index) => {
			if (field.isEnvironment === true)
				return false;
			nonEnvironmentValues.push(values[index]);
			return true;
		});

		return await replaceInFile({
			files: filesForReplace,
			allowEmptyPaths: true,
			from: nonEnvironmentFields.map((field) => {

				if (field.value){
					let value = this.escapeRegExp(field.value);

					return new RegExp(
						field.updatePrefix ?
						"(" + this.escapeRegExp(field.updatePrefix) + ")" + value :
						value,
				'g');
				}

				return new RegExp("\\\$tst\\\{" + field.token + "\\\}", 'g');
			}),
			to: nonEnvironmentValues.map((value, index) => {
				let template = nonEnvironmentFields[index];

				if (template.value && template.updatePrefix)
					return "$1" + value;

				return value;
			})
		});
	}

	getValuesFromTSTemplate(): any[] {
		let values: any[] = [];
		let newTemplateFields: ITemplateFields[] = [];
		for (let templateField of this.templateData.templateFields) {
			let value = templateField.value;
			values.push(value);

			let thisTemplateField: ITemplateFields = { name: templateField.name, token: templateField.token, prompt: templateField.prompt };
			if ('updatePrefix' in templateField) {
				thisTemplateField.updatePrefix = templateField.updatePrefix;
			}
			if ('options' in templateField) {
				thisTemplateField.options = templateField.options;
			}

			newTemplateFields.push(thisTemplateField);
		}

		this.templateData.templateFields = newTemplateFields;

		return values;
	}

	insertTrimmedName(values: any[]): any[] {
		const trimIndex = this.templateData.templateFields.findIndex((element) => element.token === 'TOKENSCRIPT_TRIM');
		const nameIndex = this.templateData.templateFields.findIndex((element) => element.token === 'TOKENSCRIPT_NAME');

		//If trim name exists (running a re-create) remove it first case the TokenScript name changed
		if (trimIndex >= 0) {
			this.templateData.templateFields.splice(trimIndex, 1);
			values.splice(trimIndex, 1);
		}

		if (nameIndex >= 0) {
			const trimVal = values[nameIndex].replace(/\s/g, "-");
			let trimEntry: ITemplateFields = { name: 'Trimmed Name', token: 'TOKENSCRIPT_TRIM', prompt: '' };
			this.templateData.templateFields.push(trimEntry);

			values.push(trimVal);
		}
		return values;
	}

	escapeRegExp(string: string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
	}
}
