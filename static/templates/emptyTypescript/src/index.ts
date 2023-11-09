
function init(){

	// @ts-ignore
	web3.tokens.dataChanged = (oldTokens, updatedTokens, cardId) => {
		const currentTokenInstance = updatedTokens.currentInstance;

		let content = "";

		switch (document.location.hash){
			case "#info":
				content = renderInfo(currentTokenInstance);
				break;
			case "#mint":
				content = renderMint(currentTokenInstance);
				break;
		}

		document.getElementById("container").innerHTML = content;
	};

	function renderInfo(currentTokenInstance){
		return `
			<h3>Welcome to TokenScript</h3>
			<p>When a card loads in TokenScript, it gets access to the token context data through TokenScript engine</p>
			<pre>
				${JSON.stringify(currentTokenInstance, null, 2)}
			</pre>
		`;
	}

	function renderMint(currentTokenInstance){
		return `
			<h3>Mint $tst{TOKENSCRIPT_NAME} ...</h3>
			<p>Actions allow you to invoke a smart contract transaction or invoke a Javascript function within the view.</p>
		`;
	}
}

init();
