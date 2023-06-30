// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import "@ethereum-attestation-service/eas-contracts/contracts/SchemaRegistry.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract EasTicketVerify {

	// add some time gap to avoid problems with clock sync
	uint constant TIME_GAP = 20;

	bytes32 constant EIP712_DOMAIN_TYPE_HASH =
	keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

	string constant attestationName = "EAS Attestation";

	// EAS lib hardcoded schema, be carefull if you are going to change it
	bytes32 constant ATTEST_TYPEHASH =
	keccak256(
		"Attest(bytes32 schema,address recipient,uint64 time,uint64 expirationTime,bool revocable,bytes32 refUID,bytes data)"
	);

	struct AttestationDomainData {
		string version;
		uint256 chainId;
		address verifyingContract;
	}

	struct AttestationCoreData {
		bytes32 schema; // The UID of the associated EAS schema
		address recipient; // The recipient of the attestation.
		uint64 time; // The time when the attestation is valid from (Unix timestamp).
		uint64 expirationTime; // The time when the attestation expires (Unix timestamp).
		bool revocable; // Whether the attestation is revocable.
		bytes32 refUID; // The UID of the related attestation.
		bytes data; // The actual Schema data (eg eventId: 12345, ticketId: 6 etc)
	}

	struct EasTicketData {
		string eventId;
		string ticketId;
		uint8 ticketClass;
		bytes commitment;
	}

	struct RevokeData {
		bytes32 uid;
		uint64 time;
	}

	function verifyEasTicket(AttestationCoreData memory attestation, bytes memory signature, address issuer, bool checkRevocation)
		public view returns (EasTicketData memory ticket) {

		AttestationDomainData memory domain = AttestationDomainData("0.26", block.chainid, 0xC2679fBD37d54388Ce493F1DB75320D236e1815e);

		// Verify EIP Signature
		address signer = recoverEasSigner(attestation, signature, domain);

		if (signer != issuer)
			revert("Attestation signer does not match required issuer");

		// Expiry check
		if (!validateTicketTimestamps(attestation))
			revert("Attestation is expired or not yet valid");

		// Revocation check
		if (checkRevocation && attestation.revocable){
			RevokeData memory revoke = verifyEasRevoked(attestation, issuer, domain.verifyingContract);
			if (revoke.time > 0)
				revert("Attestation has been revoked");
		}

		// Decode data
		(ticket.eventId, ticket.ticketId, ticket.ticketClass, ticket.commitment) = abi.decode(
			attestation.data,
			(string, string, uint8, bytes)
		);
	}

	function hashTyped(
		AttestationCoreData memory data,
		AttestationDomainData memory domainData
	) public view returns (bytes32 hash) {
		if (domainData.chainId != block.chainid) {
			revert(string.concat("Attestation for different chain: ", Strings.toString(domainData.chainId)));
		}

		hash = keccak256(
			abi.encodePacked(
				"\x19\x01", // backslash is needed to escape the character
				keccak256(
					abi.encode(
						EIP712_DOMAIN_TYPE_HASH,
						keccak256(abi.encodePacked(attestationName)),
						keccak256(abi.encodePacked(domainData.version)),
						domainData.chainId,
						domainData.verifyingContract
					)
				),
				keccak256(
					abi.encode(
						ATTEST_TYPEHASH,
						data.schema,
						data.recipient,
						data.time,
						data.expirationTime,
						data.revocable,
						data.refUID,
						keccak256(data.data)
					)
				)
			)
		);
	}

	function recoverEasSigner(
		AttestationCoreData memory data,
		bytes memory signature,
		AttestationDomainData memory domainData
	) public view returns (address) {
		// EIP721 domain type
		bytes32 hash = hashTyped(data, domainData);

		// split signature
		bytes32 r;
		bytes32 s;
		uint8 v;
		if (signature.length != 65) {
			return address(0);
		}
		assembly {
			r := mload(add(signature, 32))
			s := mload(add(signature, 64))
			v := byte(0, mload(add(signature, 96)))
		}
		if (v < 27) {
			v += 27;
		}
		if (v != 27 && v != 28) {
			return address(0);
		} else {
			// verify
			return ecrecover(hash, v, r, s);
		}
	}

	function validateTicketTimestamps(
		AttestationCoreData memory payloadObjectData
	) internal view returns (bool) {
		if (payloadObjectData.time > 0 && payloadObjectData.time > (block.timestamp + TIME_GAP)) {
			// revert("Attestation not active yet");
			return false;
		}
		if (payloadObjectData.expirationTime > 0 && payloadObjectData.expirationTime < block.timestamp) {
			// revert("Attestation expired");
			return false;
		}
		return true;
	}

	function verifyEasRevoked(
		AttestationCoreData memory payloadObjectData,
		address issuer,
		address verifyingContract
	) internal view returns (RevokeData memory revoke) {
		uint32 nonce = 0;

		// generate Attestation UID
		bytes memory pack = abi.encodePacked(
			bytesToHex(abi.encodePacked(payloadObjectData.schema)),
			payloadObjectData.recipient,
			address(0),
			payloadObjectData.time,
			payloadObjectData.expirationTime,
			payloadObjectData.revocable,
			payloadObjectData.refUID,
			payloadObjectData.data,
			nonce
		);

		revoke.uid = keccak256(pack);
		IEAS eas = IEAS(verifyingContract);

		revoke.time = eas.getRevokeOffchain(issuer, revoke.uid);
	}

	function bytesToHex(bytes memory buffer) internal pure returns (string memory) {
		// Fixed buffer size for hexadecimal convertion
		bytes memory converted = new bytes(buffer.length * 2);

		bytes memory _base = "0123456789abcdef";

		for (uint256 i = 0; i < buffer.length; i++) {
			converted[i * 2] = _base[uint8(buffer[i]) / _base.length];
			converted[i * 2 + 1] = _base[uint8(buffer[i]) % _base.length];
		}

		return string(abi.encodePacked("0x", converted));
	}
}
