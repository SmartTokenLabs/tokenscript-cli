
<script lang="ts">
	import context from "./lib/context";
	import Info from "./routes/Info.svelte";
	import NotFound from "./routes/NotFound.svelte";
	import Mint from "./routes/Mint.svelte";

	let token;
	let initialised = false;

	const routingMap = {
		'#info': Info,
		'#mint': Mint
	};

	let page;

	function routeChange() {
		page = routingMap[document.location.hash] || NotFound;
	}

	tokenscript.tokens.dataChanged = async (oldTokens, updatedTokens, cardId) => {

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
