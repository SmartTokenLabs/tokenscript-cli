import {Command, Flags} from "@oclif/core";
import * as x509 from "@peculiar/x509";
import { Crypto } from "@peculiar/webcrypto";
import * as fs from "fs-extra";
import {KeyImporter} from "../sign/keyImporter";
import inquirer from "inquirer";
import {PemConverter} from "@peculiar/x509";
import {FlagOutput} from "@oclif/core/lib/interfaces";

const crypto = new Crypto();
x509.cryptoProvider.set(crypto);

export default class Certificate extends Command {

	static CERT_REQUEST_FILENAME = "ts-certificate-request.pem";
	static CERT_FILENAME = "ts-certificate.pem";

	static description = 'Create a certificate request or sign an existing request.';

	static flags = {
		privateKeyFile: Flags.string({char: 'k', description: 'Hex encoded private key filename', default: process.cwd() + "/ts-signing.key"}),
		masterPrivateKeyFile: Flags.string({char: 'm', description: 'Hex encoded master private key filename', default: process.cwd() + "/ts-master.key"}),
		certRequestFile: Flags.string({char: 'r', description: 'Certificate signing request PEM input or output filename', default: process.cwd() + "/" + Certificate.CERT_REQUEST_FILENAME}),
		certFile: Flags.string({char: 'r', description: 'Certificate PEM input or output filename', default: process.cwd() + "/" + Certificate.CERT_FILENAME}),
		cn: Flags.string({char: 'c', description: 'The CN for the certificate, or issuer CN if signing', default: ""}),
	}

	static args = [
		{
			name: 'command',
			description: "Whether to create a signing 'request' or 'sign' an existing request",
			required: true,
			options: ["request", "sign"]
		}
	];

	public async run(): Promise<void> {

		const {args, flags} = await this.parse(Certificate);

		if (args['command'] === "request"){
			await this.createCertificateRequest(flags);
		} else if (args['command'] === "sign"){
			await this.createCertificateFromRequest(flags);
		}
	}

	private async createCertificateRequest(flags: FlagOutput){

		const privateKeyLocation = flags.privateKeyFile.toString();

		if (!fs.existsSync(privateKeyLocation)){
			this.error("Private key cannot be read at " + privateKeyLocation);
			return;
		}

		const privKeyStr = fs.readFileSync(privateKeyLocation, 'utf-8').trim();
		const keyImporter = KeyImporter.fromPrivate(privKeyStr);

		const cn = await this.getCn(flags.cn.toString());

		this.log("Creating certificate signing request...");

		const csr = await x509.Pkcs10CertificateRequestGenerator.create({
			name: "CN=" + cn,
			keys: {
				privateKey: await keyImporter.getPrivateKey(),
				publicKey: await keyImporter.getPublicKey()
			},
			signingAlgorithm: {name: "ECDSA", hash: "SHA-256"},
			extensions: [
				new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature | x509.KeyUsageFlags.keyEncipherment),
			],
			attributes: [
				new x509.ChallengePasswordAttribute("password"),
			]
		});

		await csr.verify();

		//console.log(csr.toTextObject());

		const pem = PemConverter.encode(csr.rawData, "NEW CERTIFICATE REQUEST");

		//console.log(pem);

		const reqLocation = flags.certRequestFile.toString();

		this.checkAndWriteFile(reqLocation, pem);

		this.log("Successfully created certificate request at: " + reqLocation);
	}

	private async createCertificateFromRequest(flags: FlagOutput){

		const certRequestLocation = flags.certRequestFile.toString();

		if (!fs.existsSync(certRequestLocation)){
			this.error("Certificate request cannot be read at " + certRequestLocation);
			return;
		}

		const masterPrivKeyFile = flags.masterPrivateKeyFile.toString();

		if (!fs.existsSync(masterPrivKeyFile)){
			this.error("Master private key cannot be read at " + masterPrivKeyFile);
			return;
		}

		const pem = fs.readFileSync(certRequestLocation, 'utf-8').trim();
		const csr = new x509.Pkcs10CertificateRequest(pem);

		await csr.verify();

		let signerPrivKeyStr = fs.readFileSync(masterPrivKeyFile, 'utf-8').trim();
		let signerKeyImporter = KeyImporter.fromPrivate(signerPrivKeyStr);

		const issuerCn = await this.getCn(flags.cn.toString());

		this.log("Creating certificate from signing request...");

		const masterKeyExt = new x509.Extension("2.5.29.18", true, await signerKeyImporter.getRawPublicKey());

		const cert = await x509.X509CertificateGenerator.create({
			serialNumber: "01",
			subject: csr.subjectName,
			issuer: "CN=" + issuerCn,
			notBefore: new Date(),
			notAfter: new Date(Date.now() + 3.154e+7), // one year validity
			signingAlgorithm: {name: "ECDSA", hash: "SHA-256"},
			publicKey: csr.publicKey,
			signingKey: await signerKeyImporter.getPrivateKey(),
			extensions: [
				new x509.BasicConstraintsExtension(false, 0, true), // This key should not be used to sign intermediate certs
				// new x509.ExtendedKeyUsageExtension(["1.2.3.4.5.6.7", "2.3.4.5.6.7.8"], true),
				new x509.KeyUsagesExtension(x509.KeyUsageFlags.digitalSignature, true), // This key can be used for digital signatures
				await x509.SubjectKeyIdentifierExtension.create(csr.publicKey),
				await x509.AuthorityKeyIdentifierExtension.create(await signerKeyImporter.getPublicKey()),
				masterKeyExt
			]
		});

		//console.log(cert.toTextObject());

		const certPem = PemConverter.encode(cert.rawData, "CERTIFICATE");

		//console.log(certPem);

		const certLocation = flags.certFile.toString();

		this.checkAndWriteFile(certLocation, certPem);

		this.log("Successfully created certificate at: " + certLocation);
	}

	private async getCn(cn: string){

		if (!cn){
			let responses: any = await inquirer.prompt([{
				name: "CN",
				message: "Please enter the CN for the certificate request (This should be a human readable domain or other unique identifier): ",
				type: "input",
				validate: (val) => {
					return val != "";
				}
			}]);

			cn = responses["CN"];
		}

		return cn;
	}

	private checkAndWriteFile(fileLocation: string, data: string){

		// TODO: Prompt if overwriting existing file
		if (fs.existsSync(fileLocation)){
			this.error("File already exists at: " + fileLocation);
			return;
		}

		fs.writeFileSync(fileLocation, data, 'utf-8');
	}
}
