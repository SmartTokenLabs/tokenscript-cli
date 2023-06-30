// @ts-nocheck

class Token {
	constructor(tokenInstance) {
		this.props = tokenInstance
	}

	render() {
		return `
         <h3>Sign the challenge to unlock ...</h3>
          <div id="msg">Preparing to unlock the entrance door.</div>
          <div id="inputBox">
          <h3>Door open time</h3>
          <input id="openTime" type="number" value='20' />
          </div>
          <div id="attestation">${this.props.attestation}</div>
          <div id="attestationSig">${this.props.signature}</div>
          <div id="status"/>`;
	}
}

web3.tokens.dataChanged = (oldTokens, updatedTokens, cardId) => {
	const currentTokenInstance = updatedTokens.currentInstance;
	document.getElementById(cardId).innerHTML = new Token(currentTokenInstance).render();
};

function handleErrors(response) {
	if (!response.ok) {
		throw Error(response.statusText);
	}
	return response.text();
}

var iotAddr = "0x7D586C708C741345098248D47A2D9353A1FAE115".toLowerCase();
//0x2A53DEF90EBA4248F1E14948EBF1F01BD7C44656 //0xf6bca8f191fb993d72b1cbe266ed0d8024844c47
//0xB1A6929C36C0AD999806A96DFE718777E650F395 //0x68A83B723485E7E5EDCF1C435220A60AD31241A4
var serverAddr = "http://scriptproxy.smarttokenlabs.com";
document.addEventListener("DOMContentLoaded", function() {
	window.onload = function startup() {
		// 1. call API to fetch challenge james.lug.org.cn
		fetch(`${serverAddr}:8080/api/${iotAddr}/getChallenge`)
			.then(handleErrors)
			.then(function (response) {
				document.getElementById('msg').innerHTML = 'Challenge: ' + response
				window.challenge = response
			})
	}

	window.onConfirm = function onConfirm(signature) {
		if (window.challenge === undefined || window.challenge.length == 0) return
		const challenge = window.challenge
		document.getElementById('status').innerHTML = 'Wait for signature...'
		// 2. sign challenge to generate response
		web3.personal.sign({ data: challenge }, function (error, value) {
			if (error != null) {
				document.getElementById('status').innerHTML = error
			}
			else
			{

				document.getElementById('status').innerHTML = 'Verifying credentials ...'
				// 3. open door
				// let contractAddress = document.getElementById("contractAddress").textContent;
				let unlockTime = document.getElementById("openTime").value;
				let attestationHex = document.getElementById("attestation").textContent;
				let attestationSigHex = document.getElementById("attestationSig").textContent;
				//document.getElementById('msg-txt').value;
				fetch(`${serverAddr}:8080/api/${iotAddr}/checkSignature?openTime=${unlockTime}&sig=${value}&attn=${attestationHex}&attnSig=${attestationSigHex}`)
					.then(function (response) {
						if (!response.ok) {
							document.getElementById('status').innerHTML = response.statusText;
							throw Error(response.statusText);
						}
						else
						{
							return response.text()
						}
					})
					.then(function (response) {
						if (response == "pass") {
							document.getElementById('status').innerHTML = 'Entrance granted!'
							window.close()
						} else {
							document.getElementById('status').innerHTML = 'Failed with: ' + response
						}
					}).catch(function() {
					console.log("error blah");
				});
			}
		});
		window.challenge = '';
		document.getElementById('msg').innerHTML = '';
	}
})
