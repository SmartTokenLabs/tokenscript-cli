// @ts-nocheck

class Token {
	constructor(tokenInstance) {
		this.props = tokenInstance
	}

	render() {
		return `
		  <h3>Enter Door</h3>
          <h4>Sign the challenge to unlock ...</h4>
          <div style="display: none;">
			  <div id="inputBox">
			  <h3>Door open time</h3>
			  <input id="openTime" type="number" value='20' />
			  </div>
			  <div id="attestation">${this.props.attestation}</div>
			  <div id="attestationSig">${this.props.attestationSig}</div>
          </div>
		`;
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

	function startup() {
		document.getElementById("load-status").innerText = "Fetching challenge...";
		document.getElementById("loader").style.display = "flex";
		// 1. call API to fetch challenge james.lug.org.cn
		fetch(`${serverAddr}:8080/api/${iotAddr}/getChallenge`)
			.then(handleErrors)
			.then(function (response) {
				document.getElementById('status').innerHTML = 'Challenge: ' + response
				window.challenge = response
				document.getElementById("loader").style.display = "none";
			})
	}

	window.onload = startup;

	window.onConfirm = function onConfirm() {
		if (window.challenge === undefined || window.challenge.length == 0) return
		const challenge = window.challenge
		document.getElementById("loader").style.display = "flex";
		document.getElementById('load-status').innerHTML = 'Waiting for signature...'
		// 2. sign challenge to generate response
		web3.personal.sign({ data: challenge }, function (error, value) {
			if (error != null) {
				document.getElementById('status').innerHTML = "Error: " + error.indexOf("ACTION_REJECTED") ? "Signing rejected" : error;
				document.getElementById("loader").style.display = "none";
			}
			else
			{
				window.challenge = '';
				document.getElementById('status').innerHTML = 'Verifying credentials ...'
				// 3. open door
				// let contractAddress = document.getElementById("contractAddress").textContent;
				let unlockTime = document.getElementById("openTime").value;
				let attestationHex = document.getElementById("attestation").textContent;
				let attestationSigHex = document.getElementById("attestationSig").textContent;

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

							document.getElementById("door").classList.add("opened");
							window.close()
						} else {
							document.getElementById('status').innerHTML = 'Failed with: ' + response
						}
						document.getElementById("loader").style.display = "none";

						setTimeout(() => startup(), 2000);
					}).catch(function(e) {
						document.getElementById("loader").style.display = "none";
					});
			}
		});
	}
})
