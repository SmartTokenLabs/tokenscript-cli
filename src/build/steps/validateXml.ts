import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {validateXMLWithXSD} from "super-xmlllint";

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
			// TODO: This should probably be done with Regex
			let splitError = e.message.split("<?xml");
			let afterXml = splitError[1].split("ts:token>");
			e.message = splitError[0] + (afterXml.length > 1 ? afterXml[1] : "");
			throw e;
		}

	}
}
