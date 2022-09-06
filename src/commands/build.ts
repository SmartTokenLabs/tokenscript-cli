import {Command} from "@oclif/core";
import {BuildProcessor} from "../build/buildProcessor";

export default class Create extends Command {

	static description = 'Build the tokenscript project into a .tsml'

	static flags = {}

	static args = []

	async run(): Promise<void> {

		let buildProcessor = new BuildProcessor(process.cwd(), (status) => {
			console.log(status + "\r\n");
		});

		await buildProcessor.build();
	}
}
