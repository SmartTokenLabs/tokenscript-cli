import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {validateXMLWithXSD} from "super-xmlllint";
import * as fs from "fs";

export class ValidateXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Validate TSML...");

		// TODO: Just keep the XML in memory and write it at the end
		let xml = fs.readFileSync(this.context.workspace + BuildProcessor.OUTPUT_DIR + "/tokenscript.tsml");

		const schemaVersion = xml.indexOf('xmlns:ts="http://tokenscript.org/2022/09/tokenscript"') > -1 ? "2022-09" : "2020-06";

		try {
			await validateXMLWithXSD(xml, __dirname + "/../../schema/" + schemaVersion + "/tokenscript.xsd");

		} catch (e: any){
			let splitError = e.message.split("<?xml");
			e.message = splitError[0];
			throw e;
		}

	}
}
