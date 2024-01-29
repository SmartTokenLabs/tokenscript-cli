
<script lang="ts">
	import context from "../lib/context";
	import NftIcon from "./NftIcon.svelte";
	import SablierLogo from "./SablierLogo.svelte";

	let token;

	context.data.subscribe((value) => {
		token = value.token;
	});
</script>

<style>
	.header {
		display: flex;
		align-items: center;
	}

	.details {
		flex-grow: 1;
		padding: 20px;
		text-align: left;
	}

	.details h2 {
		margin-top: 0;
		margin-bottom: 10px;
		font-size: 18px;
	}
</style>

<div class="header">
	<SablierLogo />
	<div class="details">
		<h2>{token.name}</h2>
		<div class="cat-stats">
			<div>Stream ID: {token.tokenId}</div>
		</div>
	</div>
</div>
