import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {canonicalizeXML} from "super-xmlllint";
import * as fs from "fs";

export class CanonicalizeXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {
		this.context.updateStatus("Canonicalization of XML...");

		let contents = fs.readFileSync(this.context.workspace + BuildProcessor.SRC_XML_FILE);

		let canonical = await canonicalizeXML(contents);

		fs.writeFileSync(this.context.workspace + BuildProcessor.OUTPUT_DIR + "/tokenscript.tsml", canonical.output);
	}
}
