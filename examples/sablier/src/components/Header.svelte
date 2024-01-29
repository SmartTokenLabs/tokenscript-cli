
<script lang="ts">
	import context from "../lib/context";
	import NftIcon from "./NftIcon.svelte";

	let token;

	context.data.subscribe((value) => {
		token = value.token;
	});
</script>

<style>
	.cat-header {
		display: flex;
	}

	.cat-details {
		flex-grow: 1;
		padding: 10px;
		text-align: left;
	}

	.cat-details h2 {
		margin-top: 0;
		margin-bottom: 10px;
		font-size: 18px;
	}

	.cat-icon {
		width: 100px;
	}
</style>

<div class="cat-header">
	<div class="cat-icon">
		<NftIcon imageUrl={token.image_preview_url} />
	</div>
	<div class="cat-details">
		<h2>{token.name}</h2>
		<div class="cat-stats">
			<div>Stream ID: {token.tokenId}</div>
		</div>
	</div>
</div>
