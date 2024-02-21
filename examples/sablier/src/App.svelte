
<script lang="ts">
	import context from "./lib/context";
	import Info from "./routes/Info.svelte";
	import Withdraw from "./routes/Withdraw.svelte";
	import NotFound from "./routes/NotFound.svelte";
	import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";

	let token: ITokenContextData;
	let initialised = false;

	const routingMap = {
		'#info': Info,
		'#withdraw': Withdraw,
	};

	let page;

	function routeChange() {
		page = routingMap[document.location.hash] || NotFound;
	}

	web3.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {

		if (initialised)
			return;

		context.setToken(updatedTokens.currentInstance);
		token = updatedTokens.currentInstance;

		initialised = true;

		routeChange();
	};

</script>

<svelte:window on:hashchange={routeChange} />

<div>
	<div id="token-container">
		<svelte:component this={page} />
	</div>
</div>
