import {Crypto} from "@peculiar/webcrypto";
import {
	hexStringToBase64Url,
	hexStringToUint8,
	uint8arrayToBase64
} from "../utils";

interface IKeyPreferences {
	algorithm: string;
	curve: string;
}

export class KeyImporter {

	private crypto = new Crypto();

	constructor(
		private keyPreferences: IKeyPreferences = {
			algorithm: "ECDSA",
			curve: "K-256"
		}
	) {
		// TODO: algorithm initialization
	}

	getPublicKey(hex: string){

		return this.crypto.subtle.importKey(
			"raw",
			hexStringToUint8(hex),
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["verify"]
		);
	}

	getPrivateKey(hex: string){

		return this.crypto.subtle.importKey(
			"pkcs8",
			hexStringToUint8(hex),
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["sign"]
		);
	}

}
