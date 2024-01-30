<script lang="ts">

	import context from "../lib/context";
	import Header from "../components/Header.svelte";
	import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
	import {convertDecimals, getAssetDetails} from "../lib/data";
	import Loader from "../components/Loader.svelte";
	import {convertToIntValue, formatAmount} from "../lib/data.js";

	let token: ITokenContextData;
	let assetDetails;
	let decimals: number;
	let withdrawable = "";
	let loading = true;

	const loadInfo = async (token: ITokenContextData) => {

		assetDetails = await getAssetDetails(token);
		decimals = assetDetails.decimals ? parseInt(assetDetails.decimals) : 18;

		withdrawable = convertDecimals(decimals, token.withdrawableAmount);

		loading = false;
	}

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;

		token = value.token;

		await loadInfo(token);

		tokenscript.action.setProps({
			recipient: token.ownerAddress
		});
	});
</script>

<style>

</style>

{#if token && decimals}
<div style="text-align: left; padding: 10px 10px 0;">
	<Header/>
	<div class="info-panel">
		<h3 style="text-align: center;">Withdraw {assetDetails.symbol ?? ""}</h3>
		<p style="text-align: center;">Claim available funds from Sablier contract</p>
		<div class="form-field">
			<label>How much do you want to withdraw?</label>
			<div style="position: relative; height: 58px;">
				<input type="text" placeholder="Fill in an amount" name="amount" inputmode="numeric" required on:change={(event) => {
					tokenscript.action.setProps({
						amount: convertToIntValue(decimals, event.target.value)
					});
				}} />
				<button class="button secondary" style="position:absolute; right: 10px; height: 70%; top: 15%; width: 80px;" on:click={(event) => {
					const elem = event.target.parentElement.getElementsByTagName("input")[0];
					elem.value = withdrawable;
					const changeEvt = new Event('change', {bubbles: true});
					elem.dispatchEvent(changeEvt);
				}}>MAX</button>
			</div>
			<small style="margin: 10px 0;">Available: {formatAmount(withdrawable)} {assetDetails.symbol ?? ""}</small>
		</div>
		<div class="form-field">
			<label>Where to withdraw the funds to?</label>
			<input type="text" placeholder=" " id="recipient" name="recipient" value={token.ownerAddress} required />
		</div>
	</div>
</div>
{/if}
<div>
	<Loader show={loading}/>
</div>
