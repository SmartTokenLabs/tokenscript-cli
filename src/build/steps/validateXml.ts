import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {validateXMLWithXSD} from "super-xmlllint";
import * as fs from "fs";

export class ValidateXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Validate TSML...");

		let doc = this.context.getXmlDoc();

		let ns = doc.documentElement.getAttribute("xmlns:ts");

		const schemaVersion = ns!!.indexOf("2022/09") > -1 ? "2022-09" : "2020-06";

		try {
			await validateXMLWithXSD(this.context.getXmlString(), __dirname + "/../../schema/" + schemaVersion + "/tokenscript.xsd");

		} catch (e: any){
			let splitError = e.message.split("<?xml");
			e.message = splitError[0];
			throw e;
		}

	}
}
