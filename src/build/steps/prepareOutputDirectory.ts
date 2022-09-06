import {BuildProcessor, IBuildStep} from "../buildProcessor";
import * as fs from "fs";

export class PrepareOutputDirectory implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Preparing output directory...");

		// Check for tokenscript.xml
		if (!fs.existsSync(this.context.workspace + BuildProcessor.SRC_XML_FILE)){
			throw new Error("Source xml file not found, are you executing this command from a valid TokenScript workspace?");
		}

		const outDir = this.context.workspace + BuildProcessor.OUTPUT_DIR;

		if (fs.existsSync(outDir)){
			fs.rmSync(outDir, { recursive: true })
		}

		fs.mkdirSync(outDir);
	}
}
