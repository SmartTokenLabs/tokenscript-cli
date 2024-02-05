<script lang="ts">
	import Header from "../components/Header.svelte";

	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";
	import StreamProgress from "../components/StreamProgress.svelte";
	import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
	import {convertDecimals, getAssetDetails, getWithdrawableAmount} from "../lib/data";
	import {getChainDetails} from "../lib/constants.js";
	import {formatAmount} from "../lib/data.js";
	import AssetDetails from "../components/AssetDetails.svelte";

	let token: ITokenContextData;
	let assetDetails;
	let decimals: number;
	let loading = true;
	let deposited = "";
	let withdrawn = "";
	let withdrawable = "";

	const loadInfo = async (token: ITokenContextData) => {

		token.withdrawableAmount = await getWithdrawableAmount(token);
		assetDetails = await getAssetDetails(token);
		decimals = assetDetails.decimals ? parseInt(assetDetails.decimals) : 18;

		deposited = convertDecimals(decimals, token.stream.amounts.deposited);
		withdrawn = convertDecimals(decimals, token.stream.amounts.withdrawn);
		withdrawable = convertDecimals(decimals, token.withdrawableAmount);

		loading = false;
	}

	function formatTime(epoch: number){
		const date = new Date(epoch * 1000);

		return date.toLocaleDateString() + " " + date.toLocaleTimeString();
	}

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;

		token = value.token;

		await loadInfo(value.token);
	});

</script>

<style>

	.attribute-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: calc(16px);
	}

	.grid-column {
		grid-column: span 1;
	}

	.grid-item {
		width: 100%;
		display: flex;
		flex-direction: row;
		gap: calc(12px);
		align-items: center;
	}

	.grid-item .icon-box {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 60px;
		height: 60px;
		color: rgb(60, 66, 93);
		border-radius: 18px;
		background-color: rgb(30, 33, 47);
	}

	.grid-item .icon-wrapper {
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		width: 24px;
		height: 24px;
		display: flex;
		flex-direction: row;
		align-items: center;
	}

	.grid-item .details-box {
		display: flex;
		flex-direction: row;
		gap: 4px;
		-moz-box-pack: start;
		justify-content: flex-start;
		-moz-box-align: center;
		align-items: center;
	}

	.details-box .label, .details-box .value {
		column-gap: 4px;
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
	}

	.grid-item .details-box .value {
		color: rgb(135, 146, 171);
	}
</style>

<div style="padding: 10px 10px 0">
	<Header/>
	{#if token && decimals}
	<div class="info-panel">
		<AssetDetails assetDetails={assetDetails} token={token} />
	</div>
	<div class="info-panel">
		<StreamProgress current={parseFloat(withdrawn) + parseFloat(withdrawable)} total={parseFloat(deposited)} />
	</div>
	<div class="info-panel" style="display: flex; gap: 8px; margin: 24px 0">
		<div class="score-box" style="flex: 33%;" title={deposited}>
			<label>Deposited</label>
			<span >{formatAmount(deposited)}</span>
		</div>
		<div class="score-box" style="flex: 33%;" title={withdrawn}>
			<label>Withdrawn</label>
			<span>{formatAmount(withdrawn)}</span>
		</div>
		<div class="score-box" style="flex: 33%;" title={withdrawable}>
			<label>Available</label>
			<span>{formatAmount(withdrawable)}</span>
		</div>
	</div>
	<div class="info-panel">
		<div class="attribute-grid">
			<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true"><label>Started
							on</label></div>
						<div data-component="value" class="value"><p>{formatTime(token.stream.startTime)}</p></div>
					</div>
				</div>
			</div>
			<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"></path></svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true"><label>Ends
							on</label></div>
						<div data-component="value" class="value"><p>{formatTime(token.stream.endTime)}</p></div>
					</div>
				</div>
			</div>
			<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m.002 0h-.002"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true"><label>Cancellability</label>
						</div>
						<div data-component="value" class="value"><p>{token.stream.isCancelable ? "Can" : "Cannot"} be canceled</p></div>
					</div>
				</div>
			</div>
			<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true">
							<label>Chain</label></div>
						<div data-component="value" class="value">
							<div class="sc-1f93cf44-0 sc-1f93cf44-2 GZUUM bordGp">
								<div class="sc-6b5b8381-0 sc-6b5b8381-3 hNRxPp kHoFft" data-component="icon"
									 data-purpose="image">
									<div class="sc-6b5b8381-1 iHjNjb"><!--<img alt="" loading="lazy" decoding="async"
																		   data-nimg="fill"
																		   style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"
																		   src="/_next/static/media/matic.9aee98ed.png">-->
									</div>
								</div>
								<div class="sc-1f93cf44-1 fFmeqH"><p>{getChainDetails(token.chainId).displayName}</p></div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<div style="display: flex; gap: 20px; margin-bottom: 20px;">
		<a class="button primary" href={`https://app.sablier.com/stream/LL2-${token.chainId}-${token.tokenId}/`} target="_blank">View on Sablier</a>
	</div>
	{/if}
</div>
<Loader show={loading}/>
