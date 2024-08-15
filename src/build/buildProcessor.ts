import {PrepareOutputDirectory} from "./steps/prepareOutputDirectory";
import {CanonicalizeXml} from "./steps/canonicalizeXml";
import {ValidateXml} from "./steps/validateXml";
import {InlineIncludes} from "./steps/inlineIncludes";
import {Command} from "@oclif/core";
import {resolve} from "path";
import {ApplyEnvironment} from "./steps/applyEnvironment";
import {BuildWeb} from "./steps/buildWeb";
import {ProjectContext} from "../projectContext";

export interface IBuildStep {
	runBuildStep(): void
}

export class BuildProcessor extends ProjectContext {

	static BUILD_STEPS = [
		PrepareOutputDirectory,
		BuildWeb,
		InlineIncludes,
		ApplyEnvironment,
		CanonicalizeXml,
		ValidateXml
	];

	static OUTPUT_DIR = "out";

	constructor(
		public workspace: string,
		public cli: Command,
		public args: {[key: string]: any},
		private statusCallback: (status: string) => void
	) {
		super(workspace);
	}

	updateStatus(status: string){
		this.statusCallback(status);
	}

	async build(){

		this.cli.log(`\r\nBuilding TokenScript with ${this.args.environment} environment`);

		for (let BuildStep of BuildProcessor.BUILD_STEPS){

			let buildStep = new BuildStep(this);

			await new Promise(resolve => setTimeout(resolve, 500));

			await buildStep.runBuildStep();

		}
	}

	async validate(){

		const index = BuildProcessor.BUILD_STEPS.indexOf(ValidateXml);

		const validator = new BuildProcessor.BUILD_STEPS[index](this);

		await validator.runBuildStep();

	}

	public getOutputXmlPath(){
		return resolve(this.workspace, BuildProcessor.OUTPUT_DIR, "tokenscript.tsml");
	}
}
