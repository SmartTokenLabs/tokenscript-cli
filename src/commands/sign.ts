import {Command, Flags} from '@oclif/core'
import * as xmldsigjs from "xmldsigjs";
import {Crypto, CryptoKey} from "@peculiar/webcrypto";
import * as fs from "fs-extra";
import {SignedXml} from "xmldsigjs";
import {KeyImporter} from "../sign/keyImporter";
import {uint8tohex} from "../utils";
import {computeAddress} from "ethers/lib/utils";

const crypto = new Crypto();

export default class Sign extends Command {

	static SIGNED_XML_LOC = process.cwd() + "/out/tokenscript.signed.tsml"

	static description = 'sign the built .tsml';

	/*static examples = [
	  '<%= config.bin %> <%= command.id %>',
	]*/

	static flags = {
		// flag with a value (-n, --name=VALUE)
		verify: Flags.boolean({char: 'v', description: 'Verify existing signed .tsml'}),
		privateKeyFile: Flags.string({char: 'k', description: 'Hex encoded private key file location', default: process.cwd() + "/ts-signing.key"}),
		publicKeyFile: Flags.string({char: 'p', description: 'Hex encoded private key file location', default: process.cwd() + "/ts-signing.pub"}),
	}

	//static args = [{name: 'file'}]

	public async run(): Promise<void> {

		// Fix issue with open-ssl lib shared library not loading
		process.env.OPENSSL_CONF= "/dev/null";

		const {flags} = await this.parse(Sign)

		let tsmlSrc = process.cwd() + "/out/tokenscript.tsml";

		if (!fs.existsSync(tsmlSrc)) {
			this.error("Build .tsml first", {exit: 2});
			return;
		}

		xmldsigjs.Application.setEngine("OpenSSL", crypto);

		if (flags.verify) {

			this.log("Verification only, using public key");

			const publicKeyLocation = flags.publicKeyFile.toString();

			if (!fs.existsSync(publicKeyLocation)){
				this.error("Public key cannot be read at " + publicKeyLocation);
				return;
			}

			let pubKeyStr = fs.readFileSync(publicKeyLocation, 'utf-8').trim();

			let keyImporter = KeyImporter.fromPublic(pubKeyStr);

			await this.verifySignedXml(await keyImporter.getPublicKey());
			return;
		}

		const privateKeyLocation = flags.privateKeyFile.toString();

		if (!fs.existsSync(privateKeyLocation)){
			this.error("Private key cannot be read at " + privateKeyLocation);
			return;
		}

		let privKeyStr = fs.readFileSync(privateKeyLocation, 'utf-8').trim();

		let keyImporter = KeyImporter.fromPrivate(privKeyStr);
		let privateKey = await keyImporter.getPrivateKey();
		let publicKey = await keyImporter.getPublicKey();

		//console.log("Converted private: " + uint8tohex(new Uint8Array(await crypto.subtle.exportKey("pkcs8", privateKey!!))));
		//console.log("Converted public: " + uint8tohex(new Uint8Array(await crypto.subtle.exportKey("raw", publicKey!!))));

		/*const keyPair = await crypto.subtle.generateKey(
			{
				name: "ECDSA",
				namedCurve: "K-256", // P-256, P-384, or P-521
			},
			true,
			["sign", "verify"],
		);

		console.log("Generated private: " + uint8tohex(new Uint8Array(await crypto.subtle.exportKey("pkcs8", keyPair.privateKey!!))));
		console.log("Generated public: " + uint8tohex(new Uint8Array(await crypto.subtle.exportKey("raw", keyPair.publicKey!!))));*/

		const unsignedXml = xmldsigjs.Parse(fs.readFileSync(tsmlSrc, 'utf-8'));

		const xml = new xmldsigjs.SignedXml();

		await xml.Sign(
			{name: "ECDSA", hash: "SHA-256"},
			privateKey!!,
			//keyPair.privateKey!!,
			unsignedXml,
			{                                                     // options
				keyValue: publicKey,
				references: [
					{hash: "SHA-256", transforms: ["enveloped", "c14n"]},
				]
			}
		);

		this.log("Signature created");

		this.writeSignedXml(xml);

		await this.verifySignedXml(publicKey!!);
		//await this.verifySignedXml(keyPair.publicKey!!);
	}

	private writeSignedXml(xml: SignedXml) {
		fs.writeFileSync(Sign.SIGNED_XML_LOC, xml.toString());
	}

	private async verifySignedXml(key: CryptoKey) {

		let signedXml = fs.readFileSync(Sign.SIGNED_XML_LOC, 'utf-8');

		let doc = xmldsigjs.Parse(signedXml);
		let signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");

		const xml = new xmldsigjs.SignedXml(doc);

		xml.LoadXml(signature[0]);

		let verified = await xml.Verify(key);

		if (verified){
			this.log("TSML signature successfully verified!");

			const pubKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));

			this.log("\nSigned using: ");
			this.log("Public key: ", uint8tohex(pubKey));
			this.log("Ethereum address: ", computeAddress(pubKey));

		} else {
			this.error("Signature verification failed", {exit: 2});
		}
	}

}
