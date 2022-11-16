import {CliUx, Command, Flags} from "@oclif/core";
import {Emulator} from "../emulator/emulator";
export default class Emulate extends Command {

	static description = 'Emulate the TokenScript in a browser'

	static flags = {
		emulatorHost: Flags.string({char: "e", required: false, default: ""}),
	}

	static args = []

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		const {flags} = await this.parse(Emulate);

		const emulator = new Emulator(flags.emulatorHost as string);

		this.log("Starting emulator...");

		await emulator.startEmulator();
	}
}
