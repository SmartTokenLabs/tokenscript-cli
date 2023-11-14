<script lang="ts">
	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";

	let token:unknown;
	let loading:boolean = true;
	let signature:string|undefined = undefined;
	let instruction = "";

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;
		token = value.token;
		// You can load other data before hiding the loader
		loading = false;
	});

	function applyInstruction(instuctionText:string) {
		instruction = instuctionText;
	}

	// @ts-ignore
	window.onConfirm = function onConfirm() {

		applyInstruction("Success, this page will re-direct shortly");
		
		applyInstruction("Please copy the following URL and paste it into your browser window to view the gated content https://smartlayer.network/");

	}

	function init () {

		applyInstruction("Please sign message to verify ownership of this wallet address.");

		// @ts-ignore
		web3?.personal.sign({ data: 'By signing this message you verify ownership of this address.' }, function (error:Error, value:string) {

			if(error) { 
				alert('Oops, something went wrong.');
				window.close()
			}

			applyInstruction("Please click open gate generate a custom URL.");

			signature = value;

		});
	}

	init();
	
</script>

<div>
	{#if token}
		<h3>Open Gate</h3>
		<p>Actions allow you to invoke a smart contract transaction or invoke a Javascript function within the view.</p>
		<div>{instruction}</div>
	{/if}
	<Loader show={loading}/>
</div>
<!--  -->