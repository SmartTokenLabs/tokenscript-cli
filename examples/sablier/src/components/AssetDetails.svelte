
<script lang="ts">
	import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";

	const SLN_ADDRESSES = [
		"0xdb82c0d91e057e05600c8f8dc836beb41da6df14".toLowerCase(),
		"0xF5F355746e64f5cDdd471205e9042153dB84387A".toLowerCase(),
		"0x0404ab3994ed48c300ce219546f757ad34484dc7".toLowerCase()
	]

	export let token: ITokenContextData;
	export let assetDetails;

	let image;

	$: {
		if (assetDetails?.image){
			image = assetDetails?.image;
		} else {
			if (SLN_ADDRESSES.indexOf(token.stream.asset.toLowerCase()) > -1){
				image = "https://www.smartlayer.network/icon.png";
			} else {
				image = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMjcyXzIzMzI1KSIgdmVjdG9yRWZmZWN0PSJub24tc2NhbGluZy1zdHJva2UiPgogICAgPGNpcmNsZQogICAgICByPSI5IgogICAgICBjeD0iOSIKICAgICAgY3k9IjkiCiAgICAgIGZpbGw9IiNGRkZGRkYiCiAgICAvPgogICAgPHBhdGgKICAgICAgZD0iTTYuMTg3NSAxMy41MDAxTDguNDM3NSA0LjUwMDEyTTkuNTYyNSAxMy41MDAxTDExLjgxMjUgNC41MDAxMk01LjYyNSA3LjMxMjYySDEzLjVNNC41IDEwLjY4NzZIMTIuMzc1IgogICAgICBzdHJva2U9IiMyOTJGM0IiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDBfMjcyXzIzMzI1Ij4KICAgICAgPHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiAvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+Cjwvc3ZnPg==";
			}
		}
	}
</script>

<style>
	.asset-details {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
	}

	.details {
		/*flex-grow: 1;*/
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		text-align: left;
	}
</style>

<div class="asset-details">
	<img alt="Smart Layer Network" style="width: 50px; height: auto; border-radius: 5px;" src={image}/>
	<div class="details">
		<strong style="font-size: 20px">{assetDetails.symbol}</strong>
		<strong style="font-size: 18px">{assetDetails.title}</strong>
	</div>
</div>
