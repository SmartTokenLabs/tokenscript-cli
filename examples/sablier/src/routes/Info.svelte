
<script lang="ts">
	import Header from "../components/Header.svelte";

	import context from "../lib/context";
	import NftIcon from "../components/NftIcon.svelte";
	import Loader from "../components/Loader.svelte";
	import {formatEther} from "ethers";

	let token;
	let catList = null;
	let loading = true;
	let deposited = "";
	let withdrawn = "";
	let withdrawable = "";

	const loadInfo = async () => {

		loading = false;
	}

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;

		token = value.token;
		deposited = formatEther(token.stream.amounts.deposited);
		withdrawn = formatEther(token.stream.amounts.withdrawn);
		withdrawable = formatEther(token.withdrawableAmount);
		await loadInfo();
	});

</script>

<style>
	.info-container {
		border-top: 1px solid #EEE;
		padding: 32px 16px;
	}
</style>

<div style="padding: 10px 10px 0">
	<Header/>
	<div style="display: flex; gap: 8px; margin: 24px 0">
		<div class="score-box" style="flex: 33%;">
			<label>Deposited</label>
			<span title={deposited}>{deposited.substring(0, 7)}</span>
		</div>
		<div class="score-box" style="flex: 33%;">
			<label>Withdrawn</label>
			<span title={withdrawn}>{withdrawn.substring(0, 7)}</span>
		</div>
		<div class="score-box" style="flex: 33%;">
			<label>Available</label>
			<span title={withdrawable}>{withdrawable.substring(0, 7)}</span>
		</div>
	</div>
</div>
<div>
	<Loader show={loading}/>
</div>
