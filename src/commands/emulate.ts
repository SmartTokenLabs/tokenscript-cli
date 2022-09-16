import {CliUx, Command} from "@oclif/core";
import {Emulator} from "../emulator/emulator";
export default class Emulate extends Command {

	static description = 'Emulate the TokenScript in a browser'

	static flags = {}

	static args = []

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		const path = __dirname + "../../tokenscript-playground/browser-runtime/dist";

		this.log(path);

		this.log("Starting emulator...");

		//const webpackConfig = eval(await fs.readFileSync(process.cwd() + "/webpack.config.js")) as Webpack.Configuration;

		const emulator = new Emulator();

		await emulator.startEmulator();
	}
}
