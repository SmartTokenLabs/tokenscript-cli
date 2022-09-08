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
			"jwk",
			{
				crv: this.keyPreferences.curve,
				key_ops: ["sign"],
				kty: "EC",
				x: hexStringToBase64Url(hex.substring(2,64)).replace(/=/g,''),
				y: hexStringToBase64Url(hex.substring(66,64)).replace(/=/g,'')
			},
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["verify"]
		);
	}

	getPrivateKey(hex: string, hexPub: string){

		let keyData = {
			crv: this.keyPreferences.curve,
			d: uint8arrayToBase64(hexStringToUint8(hex)),
			key_ops: ["sign", "verify"],
			kty: "EC",
			x: uint8arrayToBase64(hexStringToUint8(hexPub.substring(2,64))).replace(/=/g,''),
			y: uint8arrayToBase64(hexStringToUint8(hexPub.substring(66,64))).replace(/=/g,'')
		};

		console.log(keyData);

		return this.crypto.subtle.importKey(
			"jwk",
			keyData,
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["sign", "verify"]
		);
	}

}
