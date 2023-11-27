import { CliUx, Command } from '@oclif/core'
import { Templates } from "../create/template";
import { ITemplateData, TemplateProcessor } from "../create/templateProcessor";
import * as fs from "fs-extra";
import { join } from "path";
import ABIToScript from '../create/abiToScript';

export interface ContractLocator {
	chainId: number;
	address: string;
	name: string;
}

export default class Refresh extends Command {

	static description = 'Refresh a HardHat project';

	private dir: string = ".";

	static SRC_XML_FILE = "tokenscript.xml";

	static hardHatTemplate: string = "hardhat";
    
	async catch(error: Error) {
		// do something or
		// re-throw to be handled globally
		throw error;
	}

	async run(): Promise<void> {

		this.dir = process.cwd();

		if (fs.existsSync(this.dir)) {

			let numFiles = fs.readdirSync(this.dir).length;

			if (numFiles && fs.existsSync(join(this.dir, "tstemplate.json"))) {
				await this.handleExistingProject(Refresh.hardHatTemplate);
				return;
			} else {
                CliUx.ux.error("Cannot refresh HardHat project; use tokenscript create -h <HardHat Project Dir>");
            }
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

	private async handleExistingProject(hardHat: string): Promise<boolean> {

		let templateDef = fs.readJsonSync(this.dir + "/tstemplate.json");

		if (!templateDef)
			throw new Error("Template file is invalid or not readable");

		if (hardHat) {
			//TODO: Keep tokenscript file and work out how to make the diff
			//      For first draft, rebuild tokenscript xml base
			if (fs.existsSync(join(this.dir, "tokenscript.xml"))) {
				fs.rmSync(join(this.dir, "tokenscript.xml"),);
			}

			//add rebuild files in case we need them
			Templates.copyHHInit(this.dir);

			let templateProcessor = new TemplateProcessor(templateDef, this.dir);
			let values = templateProcessor.getValuesFromTSTemplate();
			let tokenAddress = this.getContract(values, templateDef);

			//pull HardHat directory from tstemplate
			hardHat = templateProcessor.getHardHatDirectory();

			await templateProcessor.processTemplateUpdate(values);
			let ABIEncoder = new ABIToScript(this.dir, tokenAddress);
			await ABIEncoder.initFromHardHat(hardHat, templateDef);
            Templates.cleanBuildFiles(this.dir);
			return true;
		}

		return false;
	}
}

