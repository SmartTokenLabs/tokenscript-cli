import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {hasWebBuildCommand} from "../../utils";
import exec from "child_process";

export class BuildWeb implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep(): Promise<void> {

		if (!hasWebBuildCommand(this.context.workspace)){
			return;
		}

		this.context.updateStatus("Bundling web");

		process.env.TOKENSCRIPT_ENV = this.context.args.environment;

		return new Promise<void>((resolve, reject) => {

			exec.exec("npm run ts:buildWeb", (error) => {
				if (error)
					reject(error);

				resolve();
			}).stdout?.pipe(process.stdout);
		});
	}

}
