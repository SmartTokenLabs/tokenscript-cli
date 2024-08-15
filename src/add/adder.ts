import {Command} from "@oclif/core";
import {ProjectContext} from "../projectContext";
import {resolve} from "path";
import {BuildProcessor} from "../build/buildProcessor";

export enum AbiSrc {

}

export class Adder extends ProjectContext {

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

	addContract(name: string, chain: number, address: string, abiPath?: string, fetchFromEtherscan = false){

		if (abiPath){
			// Validate ABI JSON at provided location

		} else if (fetchFromEtherscan) {
			// Try to pull ABI from etherscan
		}
	}

	private fetchAbiFromEtherscan(){

	}

	getOutputXmlPath(): string {
		return resolve(this.workspace, BuildProcessor.SRC_XML_FILE);
	}
}
