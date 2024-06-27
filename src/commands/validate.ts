import {CliUx, Command} from "@oclif/core";
import {BuildProcessor} from "../build/buildProcessor";

export default class Validate extends Command {

	static description = 'Validate an existing .tsml'

	static flags = {}

	static args = []

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message ?? error);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		let buildProcessor = new BuildProcessor(process.cwd(), this, {}, (status) => {
			CliUx.ux.action.start(status);
		});

		await buildProcessor.validate();

		CliUx.ux.action.stop();

		console.log("\r\nTokenScript validated successfully!");
	}
}
