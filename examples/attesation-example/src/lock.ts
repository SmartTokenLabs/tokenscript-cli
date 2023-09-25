// @ts-nocheck

class Token {
	constructor(tokenInstance) {
		this.props = tokenInstance
	}

	render() {
		return `
		  <h3>Lock Door</h3>
          <h4>Sign the challenge to lock ...</h4>
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

const iotAddr = "0x32A611066C00A043C202889D67DF86F4F2C82285".toLowerCase();
const serverAddr = "https://scriptproxy.smarttokenlabs.com";

document.addEventListener("DOMContentLoaded", function() {

	function startup() {
		document.getElementById("load-status2").innerText = "Fetching challenge...";
		document.getElementById("loader2").style.display = "flex";
		// 1. call API to fetch challenge james.lug.org.cn
		fetch(`${serverAddr}:8433/api/${iotAddr}/getChallenge`)
			.then(handleErrors)
			.then(function (response) {
				document.getElementById('status2').innerHTML = 'Challenge: ' + response
				window.challenge = response
				document.getElementById("loader2").style.display = "none";
			})
	}

	window.onload = startup;

	window.onConfirm = function onConfirm() {
		if (window.challenge === undefined || window.challenge.length == 0) return
		const challenge = window.challenge
		document.getElementById("loader2").style.display = "flex";
		document.getElementById('load-status2').innerHTML = 'Waiting for signature...'
		// 2. sign challenge to generate response
		web3.personal.sign({ data: challenge }, function (error, value) {
			if (error != null) {
				document.getElementById('status2').innerHTML = "Error: " + error.indexOf("ACTION_REJECTED") ? "Signing rejected" : error;
				document.getElementById("loader2").style.display = "none";
			}
			else
			{
				window.challenge = '';
				document.getElementById('status2').innerHTML = 'Verifying credentials ...'
				document.getElementById('load-status2').innerHTML = 'Verifying credentials ...'
				// 3. open door
				// let contractAddress = document.getElementById("contractAddress").textContent;
				let unlockTime = document.getElementById("openTime").value;
				let attestationHex = document.getElementById("attestation").textContent;
				let attestationSigHex = document.getElementById("attestationSig").textContent;

				fetch(`${serverAddr}:8433/api/${iotAddr}/checkSignatureLock?openTime=0&sig=${value}&attn=${attestationHex}&attnSig=${attestationSigHex}`)
					.then(function (response) {
						if (!response.ok) {
							document.getElementById('status2').innerHTML = response.statusText;
							throw Error(response.statusText);
						}
						else
						{
							return response.text()
						}
					})
					.then(function (response) {
						if (response == "pass") {
							document.getElementById('status2').innerHTML = 'Entrance granted!'

							document.getElementsByClassName("door")[0].classList.remove("opened");

							setTimeout(() => window.close(), 2000);
						} else {
							document.getElementById('status2').innerHTML = 'Failed with: ' + response
						}
						document.getElementById("loader2").style.display = "none";

						setTimeout(() => startup(), 2000);
					}).catch(function(e) {
						document.getElementById("loader2").style.display = "none";
					});
			}
		});
	}
})
