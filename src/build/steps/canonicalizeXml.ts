import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {canonicalizeXML} from "super-xmlllint";
import * as fs from "fs";

export class CanonicalizeXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Canonicalization of XML...");

		//let contents = this.context.getXmlString();
		let contents = fs.readFileSync(this.context.workspace + BuildProcessor.SRC_XML_FILE);

		let canonical = await canonicalizeXML(contents, "c14n");

		this.context.setXmlString(canonical.output);
	}
}
