import {CliUx, Command} from "@oclif/core";
import {BuildProcessor} from "../build/buildProcessor";

export default class Create extends Command {

	static description = 'Build the tokenscript project into a .tsml'

	static flags = {}

	static args = []

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		let buildProcessor = new BuildProcessor(process.cwd(), (status) => {
			CliUx.ux.action.start(status);
		});

		await buildProcessor.build();

		CliUx.ux.action.stop();

		console.log("\r\nTokenScript build completed successfully!");
	}
}
