
import * as QRCode from "qrcode";

function initIndex(){

	// @ts-ignore
	web3.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {
		const currentTokenInstance = updatedTokens.currentInstance;

		document.getElementById("attestation-container").innerHTML = `
			<h2>${currentTokenInstance.name}</h2>
			<p>${currentTokenInstance.description}</p>
			<img src="${currentTokenInstance.image_preview_url}"/>
			<div>${currentTokenInstance.tokenId}</div>
		`;

		document.getElementById("qrcode").setAttribute("src", await QRCode.toDataURL(currentTokenInstance.tokenInfo.token))
	};
}

initIndex();
