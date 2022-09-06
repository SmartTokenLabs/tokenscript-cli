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

		let res = await validateXMLWithXSD(xml, __dirname + "/../../tokenscript/schema/2020-06/tokenscript.xsd");

		console.log(res);
	}
}
