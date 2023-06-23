
function initMint(){

	// @ts-ignore
	web3.tokens.dataChanged = (oldTokens, updatedTokens, cardId) => {
		const currentTokenInstance = updatedTokens.currentInstance;

		console.log(currentTokenInstance);

		//document.getElementById(cardId).innerHTML = new Token(currentTokenInstance).render();
	};
}

initMint();
