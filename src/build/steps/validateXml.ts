import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {validateXMLWithXSD} from "super-xmlllint";
import * as fs from "fs";

export class ValidateXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Validate XML...");

		// TODO: Just keep the XML in memory and write it at the end
		let xml = fs.readFileSync(this.context.workspace + BuildProcessor.OUTPUT_DIR + "/tokenscript.tsml");

		try {
			await validateXMLWithXSD(xml, __dirname + "/../../schema/2020-06/tokenscript.xsd");

		} catch (e: any){
			let splitError = e.message.split("-:");
			e.message = splitError[0] + "\r\n" + splitError[2].split("-")[0];
			throw e;
		}

	}
}
