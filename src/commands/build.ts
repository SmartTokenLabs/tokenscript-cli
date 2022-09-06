import {Command} from "@oclif/core";


export default class Create extends Command {

	static description = 'Build the tokenscript project into a .tsml'

	static flags = {}

	static args = []

	async run(): Promise<void> {
		this.log('Build not implemented')
	}
}
