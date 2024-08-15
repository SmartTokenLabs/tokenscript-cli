import {BuildProcessor, IBuildStep} from "../buildProcessor";

export class ApplyEnvironment implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep(): Promise<void> {

		this.context.updateStatus("Applying environment variables");

		let doc = this.context.getXmlString();

		const env = this.context.getEnvironment(this.context.args.environment);

		for (const key in env){
			doc = doc.replace(new RegExp("\\\$tst\\\{" + key + "\\\}", 'g'), env[key]);
		}

		this.context.setXmlString(doc);
	}

}
