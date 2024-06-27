import {CliUx, Command, Flags} from "@oclif/core";
import {BuildProcessor} from "../build/buildProcessor";

export default class Build extends Command {

	static description = 'Build the tokenscript project into a .tsml'

	static flags = {
		outputTemplate: Flags.boolean({char: 't', description: 'Output a .tsml template that can be used to serve TokenScripts on-the-fly for multiple contracts', default: false}),
	}

	static args = [
		{
			name: 'environment',
			description: "The environment configuration to use for the build",
			required: false,
			default: process.env.TOKENSCRIPT_ENV ?? "default"
		}
	]

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		const {args} = await this.parse(Build);

		const buildProcessor = new BuildProcessor(process.cwd(), this, args, (status) => {
			CliUx.ux.action.start(status);
		});

		await buildProcessor.build();

		CliUx.ux.action.stop();

		console.log("\r\nTokenScript build completed successfully!");
	}
}
