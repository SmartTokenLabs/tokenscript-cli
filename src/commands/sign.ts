import {Command, Flags} from '@oclif/core'
import * as xmldsigjs from "xmldsigjs";
import {Crypto, CryptoKey} from "@peculiar/webcrypto";
import * as fs from "fs-extra";
import {Signature} from "xmldsigjs";
import {KeyImporter} from "../sign/keyImporter";

export default class Sign extends Command {

  static SIGNED_XML_LOC = process.cwd() + "/out/tokenscript.signed.tsml"

  static description = 'sign the built .tsml';

  /*static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]*/

  static flags = {
    // flag with a value (-n, --name=VALUE)
    verify: Flags.boolean({char: 'v', description: 'Verify existing signed .tsml'}),
    // flag with no value (-f, --force)
    force: Flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  public async run(): Promise<void> {

    const {args, flags} = await this.parse(Sign)

	  let tsmlSrc = process.cwd() + "/out/tokenscript.tsml";

    if (!fs.existsSync(tsmlSrc)){
		this.error("Build .tsml first", {exit: 2});
		return;
	}

	const privateKeyLocation = process.cwd() + "/../test.key";
	const publicKeyLocation = process.cwd() + "/../test.pub";

	const crypto = new Crypto();

    xmldsigjs.Application.setEngine("OpenSSL", crypto);

	const xml = new xmldsigjs.SignedXml();

	// Import into CryptoKey from hex or PEM
	/*let privKey = fs.readFileSync(privateKeyLocation, 'utf-8');
    let pubKey = fs.readFileSync(publicKeyLocation, 'utf-8');

	let keyImporter = new KeyImporter();
	let publicKey = await keyImporter.getPublicKey(pubKey);
	let privateKey = await keyImporter.getPrivateKey(privKey, pubKey);*/

	  const keyPair = await crypto.subtle.generateKey(
		  {
			  name: "ECDSA",
			  namedCurve: "K-256", // P-256, P-384, or P-521
		  },
		  true,
		  ["sign", "verify"],
	  );

	  const privateKey = keyPair.privateKey;
	  const publicKey = keyPair.publicKey;

	  /*if (!privKey || !pubKey)
		  throw new Error("Key generation failed");*/

	  if (flags.verify){
		  console.log("Verification only");
		  await this.verifySignedXml(publicKey!!);
		  return;
	  }

    const unsignedXml = xmldsigjs.Parse(fs.readFileSync(tsmlSrc, 'utf-8'));

	const sig = await xml.Sign(
		{ name: "ECDSA", hash: "SHA-256" },
		privateKey!!,
		unsignedXml,
		{                                                     // options
			keyValue: publicKey,
			references: [
				{ hash: "SHA-256", transforms: ["enveloped", "c14n"] },
			]
		}
	);

	this.writeSignedXml(unsignedXml, sig);

	await this.verifySignedXml(publicKey!!);
  }

  private writeSignedXml(unsignedXml: Document, sig: Signature){

	  unsignedXml.appendChild(sig.GetXml(true) as Node);

	  let xmlStr = new XMLSerializer().serializeToString(unsignedXml);

	  // TODO: Not supporting multiple root nodes at this time
	  //xmlStr = xmlFormatter(new XMLSerializer().serializeToString(sig.GetXml(true)!!));

	  fs.writeFileSync(Sign.SIGNED_XML_LOC, xmlStr);
  }

  private async verifySignedXml(key: CryptoKey){

	  let signedXml = fs.readFileSync(Sign.SIGNED_XML_LOC, 'utf-8');

	  let doc = xmldsigjs.Parse(signedXml);
	  let signature = doc.getElementsByTagNameNS("http://www.w3.org/2000/09/xmldsig#", "Signature");
	  doc.removeChild(signature[0]);

	  const xml = new xmldsigjs.SignedXml(doc);

	  xml.LoadXml(signature[0]);

	  let verified = await xml.Verify(key);

	  console.log("Verified: " + verified);
  }

  private hexToArrayBuffer(hex: string){

	  let match = hex.match(/[\da-f]{2}/gi);

	  if (!match)
		  return new Uint8Array([]).buffer;

	  return new Uint8Array(match.map(function (h) {
		  return parseInt(h, 16)
	  })).buffer;
  }
}
