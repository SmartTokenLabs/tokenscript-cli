import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {ethers} from "hardhat";
import {EasTicketAttestation} from "@tokenscript/attestation/dist/eas/EasTicketAttestation";
import {Signer} from "ethers";
import {joinSignature, defaultAbiCoder} from "ethers/lib/utils";
import {expect} from "chai";

describe("DevconSouvenir", function () {

	const SEPOLIA_RPC = 'https://rpc.sepolia.org/'

	const EAS_CONFIG = {
		address: '0xC2679fBD37d54388Ce493F1DB75320D236e1815e',
		version: '0.26',
		chainId: 11155111,
	}

	const EAS_TICKET_SCHEMA = {
		fields: [
			{ name: 'eventId', type: 'string' },
			{ name: 'ticketId', type: 'string' },
			{ name: 'ticketClass', type: 'uint8' },
			{ name: 'commitment', type: 'bytes', isCommitment: true },
		],
	}

	async function createAttestation(data : {eventId: string, ticketId: string, ticketClass: number, commitment: string}, wallet: Signer, validity?: {from: number, to: number}){

		const attestationManager = new EasTicketAttestation(EAS_TICKET_SCHEMA, {
			EASconfig: EAS_CONFIG,
			signer: wallet
		}, {11155111: SEPOLIA_RPC});

		const signedAttestation = await attestationManager.createEasAttestation(data, {
			validity
		});

		// ABI encode attestation.
		// TODO: Add this into attestation library
		const attestationData = defaultAbiCoder.encode(
			signedAttestation.sig.types.Attest.map((field) => field.type),
			signedAttestation.sig.types.Attest.map((field) => signedAttestation.sig.message[field.name])
		);

		const domainData = defaultAbiCoder.encode(
			["string", "uint256", "address"],
			[signedAttestation.sig.domain.version, signedAttestation.sig.domain.chainId, signedAttestation.sig.domain.verifyingContract]
		);

		const attestation = defaultAbiCoder.encode(
			["bytes", "bytes"], [domainData, attestationData]
		)

		return {attestation, signature: joinSignature(signedAttestation.sig.signature)}
	}

	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployOneYearLockFixture() {
		// Contracts are deployed using the first signer/account by default
		const [owner, otherAccount] = await ethers.getSigners();

		const DevconSouvenir = await ethers.getContractFactory("DevconSouvenir", owner);
		const devconSouvenir = await DevconSouvenir.deploy(owner.address);

		return {devconSouvenir, owner, otherAccount};
	}

	describe("Deployment", function () {

		it("Valid attestation should mint token", async function () {
			const {devconSouvenir, owner} = await loadFixture(deployOneYearLockFixture);

			const {attestation, signature} = await createAttestation({eventId: "devcon6", ticketId: "12345", ticketClass: 2, commitment: "email@test.com"}, owner);

			await devconSouvenir.mintUsingAttestation(attestation, signature);

			expect(await devconSouvenir.isRedeemed(parseInt("12345"))).to.equal(true);
		});

		it("Invalid attestation attestor should revert", async function () {
			const {devconSouvenir, otherAccount} = await loadFixture(deployOneYearLockFixture);

			const {attestation, signature} = await createAttestation({eventId: "devcon6", ticketId: "12345", ticketClass: 2, commitment: "email@test.com"}, otherAccount);

			await expect(devconSouvenir.mintUsingAttestation(attestation, signature))
				.to.be.revertedWith('Attestation signer does not match required issuer');
		});

		it("Expired or not yet valid attestation attestor should revert", async function () {
			const {devconSouvenir, owner} = await loadFixture(deployOneYearLockFixture);

			let attestation = await createAttestation(
				{eventId: "devcon6", ticketId: "12345", ticketClass: 2, commitment: "email@test.com"}, owner,
				{from: Math.round(Date.now()/1000) + 10000, to: Math.round(Date.now()/1000) + 20000});

			await expect(devconSouvenir.mintUsingAttestation(attestation.attestation, attestation.signature))
				.to.be.revertedWith('Attestation is expired or not yet valid');

			attestation = await createAttestation(
				{eventId: "devcon6", ticketId: "12345", ticketClass: 2, commitment: "email@test.com"}, owner,
				{from: Math.round(Date.now()/1000) - 10000, to: Math.round(Date.now()/1000) - 20000});

			await expect(devconSouvenir.mintUsingAttestation(attestation.attestation, attestation.signature))
				.to.be.revertedWith('Attestation is expired or not yet valid');
		});

		it("Already minted token should not mint again", async function () {
			const {devconSouvenir, owner} = await loadFixture(deployOneYearLockFixture);

			const {attestation, signature} = await createAttestation({eventId: "devcon6", ticketId: "12345", ticketClass: 2, commitment: "email@test.com"}, owner);

			await devconSouvenir.mintUsingAttestation(attestation, signature);

			await expect(devconSouvenir.mintUsingAttestation(attestation, signature))
				.to.be.revertedWith('Souvenir for this ticket has already been minted');
		});
	});

});
