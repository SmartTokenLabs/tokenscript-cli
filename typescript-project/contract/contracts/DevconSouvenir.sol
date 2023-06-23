// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./EasTicketVerify.sol";


contract DevconSouvenir is ERC721, ERC721Enumerable, ERC721Burnable, Ownable, EasTicketVerify {

	bytes32 constant EVENT_ID = keccak256(abi.encodePacked("devcon6"));

	string tokenUri = "https://ipfs.moralis.io:2053/ipfs/QmSuaxSVzvLVFemhYLCfcVBtp4b8yz3QDygYUVK64bnvjP";
	address issuer = 0xe761Eb6e829DE49deaB008120733c1E35Acf77DB;

	constructor(address initialIssuer) ERC721("Devcon 6 Souvenir", "DEVCON6") {
		issuer = initialIssuer;
	}

	function setTokenUri(string memory uri) public onlyOwner {
		tokenUri = uri;
	}

	function setIssuer(address newIssuer) public onlyOwner {
		issuer = newIssuer;
	}

	function safeMint(address to, uint256 tokenId)
	public
	onlyOwner
	{
		_safeMint(to, tokenId);
		//_setTokenURI(tokenId, tokenUri);
	}

	function mintUsingAttestation(bytes memory attestation, bytes memory signature)
	public
	{
		EasTicketData memory ticket = verifyEasTicket(attestation, signature, issuer, msg.sender != owner());

		if (keccak256(abi.encodePacked(ticket.eventId)) != EVENT_ID)
			revert("Attestation is for wrong event");

		uint256 tokenId = uint256(stringToUint(ticket.ticketId));

		if (_exists(tokenId))
			revert("Souvenir for this ticket has already been minted");

		safeMint(msg.sender, tokenId);
	}

	function stringToUint(string memory s) public pure returns (uint) {
		bytes memory b = bytes(s);
		uint result = 0;
		for (uint256 i = 0; i < b.length; i++) {
			uint256 c = uint256(uint8(b[i]));
			if (c >= 48 && c <= 57) {
				result = result * 10 + (c - 48);
			}
		}
		return result;
	}

	function burn(uint256 tokenId) public override(ERC721Burnable) {

		if (ownerOf(tokenId) != msg.sender) {
			revert("Address does not own required token :-(");
		}

		super.burn(tokenId);
	}

	function isRedeemed(uint256 tokenId) public view returns (bool)
	{
		return _exists(tokenId);
	}

	// The following functions are overrides required by Solidity.

	function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
	internal
	override(ERC721, ERC721Enumerable)
	{
		super._beforeTokenTransfer(from, to, tokenId, batchSize);
	}

	function _burn(uint256 tokenId) internal override(ERC721) {
		super._burn(tokenId);
	}

	function tokenURI(uint256)
	public
	view
	override(ERC721)
	returns (string memory)
	{
		return tokenUri;
		// return super.tokenURI(tokenId);
	}

	function supportsInterface(bytes4 interfaceId)
	public
	view
	override(ERC721, ERC721Enumerable)
	returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}
