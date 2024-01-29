<script lang="ts">

	import context from "../lib/context";
	import {formatEther} from "ethers";
	import Header from "../components/Header.svelte";

	let token;
	let withdrawable = "";

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;

		token = value.token;

		withdrawable = formatEther(token.withdrawableAmount);
	});
</script>

<style>

</style>


<div style="text-align: left; padding: 10px 10px 0;">
	<Header/>
	<br/>
	<div class="info-panel">
		<h3 style="text-align: center;">Withdraw</h3>
		<p style="text-align: center;">Claim available funds from Sablier contract</p>
		<div class="form-field">
			<input type="text" placeholder=" " id="recipient" name="recipient" value={token.ownerAddress} required />
			<label on:click={() => document.getElementById("recipient").focus()}>To</label>
		</div>
		<div class="form-field">
			<input type="text" placeholder=" " id="amount" name="amount" required />
			<label on:click={() => document.getElementById("amount").focus()}>Amount</label>
			<small>Available: {withdrawable.substring(0, 7)}</small>
		</div>
	</div>
</div>
