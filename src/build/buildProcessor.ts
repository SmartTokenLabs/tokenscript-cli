import {PrepareOutputDirectory} from "./steps/prepareOutputDirectory";
import {CanonicalizeXml} from "./steps/canonicalizeXml";
import {ValidateXml} from "./steps/validateXml";

export interface IBuildStep {
	runBuildStep(): void
}

export class BuildProcessor {

	static BUILD_STEPS = [
		PrepareOutputDirectory,
		CanonicalizeXml,
		ValidateXml
	];

	static OUTPUT_DIR = "/out";
	static SRC_XML_FILE = "/tokenscript.xml";

	constructor(
		public workspace: string,
		private statusCallback: (status: string) => void
	) {

	}

	updateStatus(status: string){
		this.statusCallback(status);
	}

	async build(){

		for (let BuildStep of BuildProcessor.BUILD_STEPS){

			let buildStep = new BuildStep(this);

			await new Promise(resolve => setTimeout(resolve, 500));

			await buildStep.runBuildStep();

		}
	}

}
