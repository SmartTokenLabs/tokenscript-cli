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

var iotAddr = "0x32A611066C00A043C202889D67DF86F4F2C82285".toLowerCase();
var serverAddr = "https://scriptproxy.smarttokenlabs.com";

document.addEventListener("DOMContentLoaded", function() {

	function startup() {
		document.getElementById("load-status").innerText = "Fetching challenge...";
		document.getElementById("loader").style.display = "flex";
		// 1. call API to fetch challenge james.lug.org.cn
		fetch(`${serverAddr}:8433/api/${iotAddr}/getChallenge`)
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
				document.getElementById('status').innerHTML = 'Verifying credentials ...';
				document.getElementById('load-status').innerHTML = 'Verifying credentials ...';
				// 3. open door
				// let contractAddress = document.getElementById("contractAddress").textContent;
				let unlockTime = document.getElementById("openTime").value;
				let attestationHex = document.getElementById("attestation").textContent;
				let attestationSigHex = document.getElementById("attestationSig").textContent;

				fetch(`${serverAddr}:8433/api/${iotAddr}/checkSignature?openTime=${unlockTime}&sig=${value}&attn=${attestationHex}&attnSig=${attestationSigHex}`)
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

							document.getElementsByClassName("door")[0].classList.add("opened");

							setTimeout(() => window.close(), 2000);
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
