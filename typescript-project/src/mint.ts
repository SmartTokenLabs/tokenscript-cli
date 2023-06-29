
function initMint(){

	// @ts-ignore
	web3.tokens.dataChanged = (oldTokens, updatedTokens, cardId) => {
		const currentTokenInstance = updatedTokens.currentInstance;

		// @ts-ignore
		/*web3.action.setProps({
			...currentTokenInstance.tokenInfo.abiEncoded
		});*/

		//document.getElementById(cardId).innerHTML = new Token(currentTokenInstance).render();
	};
}

initMint();
