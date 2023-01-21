import {Crypto} from "@peculiar/webcrypto";
import {hexStringToUint8} from "../utils";
import {ec as EC} from "elliptic";
import {ECParameters, ECPrivateKey} from "@peculiar/asn1-ecc";
import {AsnSerializer, OctetString} from "@peculiar/asn1-schema";
import {PrivateKeyInfo} from "@peculiar/asn1-pkcs8";
import {AlgorithmIdentifier} from "@peculiar/asn1-x509";

interface IKeyPreferences {
	algorithm: string;
	curve: string;
}

const defaultKeyPrefs: IKeyPreferences  = {
	algorithm: "ECDSA",
	curve: "K-256"
}

export class KeyImporter {

	private crypto = new Crypto();

	constructor(
		private keyPreferences: IKeyPreferences = defaultKeyPrefs,
		private ecKey: EC.KeyPair
	) {
		// TODO: algorithm initialization
	}

	static fromPrivate(hex: string, keyPreferences: IKeyPreferences = defaultKeyPrefs){

		if (keyPreferences.algorithm === "ECDSA"){
			if (keyPreferences.curve === "K-256"){
				let ec = new EC('secp256k1');
				// TODO: Support base64 & pem encoding
				return new KeyImporter(keyPreferences, ec.keyFromPrivate(hexStringToUint8(hex)));
			}
		}

		throw new Error("Key algorithm or curve is not supported!");
	}

	static fromPublic(hex: string, keyPreferences: IKeyPreferences = defaultKeyPrefs){

		if (keyPreferences.algorithm === "ECDSA"){
			if (keyPreferences.curve === "K-256"){
				let ec = new EC('secp256k1');
				return new KeyImporter(keyPreferences, ec.keyFromPublic(hexStringToUint8(hex)));
			}
		}

		throw new Error("Key algorithm or curve is not supported!");
	}

	getPublicKey(){

		const pub = this.ecKey.getPublic().encode("array", false)

		return this.crypto.subtle.importKey(
			"raw",
			new Uint8Array(pub),
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["verify"]
		);
	}

	getRawPublicKey(){
		return new Uint8Array(this.ecKey.getPublic().encode("array", false));
	}

	getPrivateKey(){

		const priv = this.getPkcs8FromECKey(this.ecKey);

		return this.crypto.subtle.importKey(
			"pkcs8",
			priv,
			{
				name: this.keyPreferences.algorithm,
				namedCurve: this.keyPreferences.curve
			},
			true,
			["sign"]
		);
	}

	private getPkcs8FromECKey(keyPair: EC.KeyPair){

		let ecKeyInfo = new ECPrivateKey();

		ecKeyInfo.version = 1;
		ecKeyInfo.parameters = new ECParameters();
		ecKeyInfo.parameters.namedCurve = "1.3.132.0.10";
		ecKeyInfo.privateKey = new OctetString(hexStringToUint8(keyPair.getPrivate().toString("hex")));
		ecKeyInfo.publicKey = hexStringToUint8(keyPair.getPublic().encode("hex", false));

		let ecParams = new ECParameters();
		ecParams.namedCurve = "1.3.132.0.10";

		let convertedAsn = new PrivateKeyInfo();
		convertedAsn.version = 0;
		convertedAsn.privateKeyAlgorithm = new AlgorithmIdentifier({
			algorithm: "1.2.840.10045.2.1",
			parameters: AsnSerializer.serialize(ecParams)
		});
		convertedAsn.privateKey = new OctetString(AsnSerializer.serialize(ecKeyInfo));

		return new Uint8Array(AsnSerializer.serialize(convertedAsn));
	}

}
