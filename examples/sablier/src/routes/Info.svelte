<script lang="ts">
	import Header from "../components/Header.svelte";

	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";
	import {formatEther} from "ethers";
	import StreamProgress from "../components/StreamProgress.svelte";

	let token;
	let catList = null;
	let loading = true;
	let deposited = "";
	let withdrawn = "";
	let withdrawable = "";

	const loadInfo = async () => {

		loading = false;
	}

	function commify(value) {
		const match = value.match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
		if (!match || (!match[2] && !match[4])) {
			throw new Error(`bad formatted number: ${ JSON.stringify(value) }`);
		}

		const neg = match[1];
		const whole = BigInt(match[2] || 0).toLocaleString("en-us");
		const frac = match[4] && match[4].match(/^(.*?)0*$/)[1] != "" ? match[4].match(/^(.*?)0*$/)[1] : "00";

		return `${ neg }${ whole }.${ frac }`;
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

	.info-panel {
		padding: 16px;
		background-color: rgb(36, 40, 56);
		border-radius: 12px;
		margin: 24px 0;
	}

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

	.asset-details {
		display: flex;
	}

	.details {
		flex-grow: 1;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

<div style="padding: 10px 10px 0">
	<Header/>
	<div class="info-panel asset-details">
		<img alt="Smart Layer Network" style="width: 50px; height: auto; border-radius: 5px;" src="https://www.smartlayer.network/icon.png"/>
		<div class="details">
			<strong style="font-size: 20px">Smart Layer Network (SLN)</strong>
		</div>
	</div>
	<div class="info-panel">
		<StreamProgress current={parseFloat(withdrawn) + parseFloat(withdrawable)} total={parseFloat(deposited)} />
	</div>
	<div class="info-panel" style="display: flex; gap: 8px; margin: 24px 0">
		<div class="score-box" style="flex: 33%;" title={deposited}>
			<label>Deposited</label>
			<span >{commify(deposited).substring(0, deposited.indexOf(".") + 4)}</span>
		</div>
		<div class="score-box" style="flex: 33%;" title={withdrawn}>
			<label>Withdrawn</label>
			<span>{commify(withdrawn).substring(0, withdrawn.indexOf(".") + 4)}</span>
		</div>
		<div class="score-box" style="flex: 33%;" title={withdrawable}>
			<label>Available</label>
			<span>{commify(withdrawable).substring(0, withdrawable.indexOf(".") + 4)}</span>
		</div>
	</div>
	<div class="info-panel">
		<div class="attribute-grid">
			<!--<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true">
							<label>Shape</label></div>
						<div data-component="value" class="value"><p>Cliff stream</p></div>
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
									  d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true">
							<label>Status</label></div>
						<div data-component="value" class="value"><p>Streaming</p></div>
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
									  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true"><label>Expected
							Payout</label></div>
						<div data-component="value" class="value">
							<div class="value">
								<div class="sc-56b0e719-0 sc-56b0e719-2 lbJJXj wWDhW">
									<div class="sc-6b5b8381-0 sc-6b5b8381-3 hNRxPp kHoFft" data-component="icon"
										 data-purpose="image">
										<div class="sc-6b5b8381-1 iHjNjb"><img alt="" decoding="async" data-nimg="fill"
																			   style="position: absolute; height: 20px; width: 20px; inset: 0px; color: transparent;"
																			   src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAxOCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBjbGlwLXBhdGg9InVybCgjY2xpcDBfMjcyXzIzMzI1KSIgdmVjdG9yRWZmZWN0PSJub24tc2NhbGluZy1zdHJva2UiPgogICAgPGNpcmNsZQogICAgICByPSI5IgogICAgICBjeD0iOSIKICAgICAgY3k9IjkiCiAgICAgIGZpbGw9IiNGRkZGRkYiCiAgICAvPgogICAgPHBhdGgKICAgICAgZD0iTTYuMTg3NSAxMy41MDAxTDguNDM3NSA0LjUwMDEyTTkuNTYyNSAxMy41MDAxTDExLjgxMjUgNC41MDAxMk01LjYyNSA3LjMxMjYySDEzLjVNNC41IDEwLjY4NzZIMTIuMzc1IgogICAgICBzdHJva2U9IiMyOTJGM0IiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiAvPgogIDwvZz4KICA8ZGVmcz4KICAgIDxjbGlwUGF0aCBpZD0iY2xpcDBfMjcyXzIzMzI1Ij4KICAgICAgPHJlY3Qgd2lkdGg9IjE4IiBoZWlnaHQ9IjE4IiAvPgogICAgPC9jbGlwUGF0aD4KICA8L2RlZnM+Cjwvc3ZnPg==">
										</div>
									</div>
									<div class="sc-56b0e719-1 geLzXU"><p>tsln2</p></div>
								</div>
								<div title="125000" class="sc-e24ef726-1 dxzfWj"><p>125K</p></div>
							</div>
						</div>
					</div>
				</div>
			</div>-->
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
						<div data-component="value" class="value"><p>Dec 12 '23 @ 3 pm</p></div>
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
						<div data-component="value" class="value"><p>Dec 12 '23 @ 3 pm</p></div>
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
						<div class="label" data-component="label" data-icon-last="true"><label>Cancelability</label>
						</div>
						<div data-component="value" class="value"><p>Can be canceled</p></div>
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
								<div class="sc-1f93cf44-1 fFmeqH"><p>Polygon</p></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!--<div class="grid-column">
				<div class="grid-item">
					<div data-component="frame" class="icon-box">
						<div class="icon-wrapper" data-component="icon"
							 data-purpose="heroicon">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
								 stroke="currentColor" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round"
									  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
						</div>
					</div>
					<div data-component="content" class="details-box">
						<div class="label" data-component="label" data-icon-last="true">
							<label>Cliff</label></div>
						<div data-component="value" class="value"><p>An hour (.01%)</p></div>
					</div>
				</div>
			</div>-->
		</div>
	</div>
</div>
<div>
	<Loader show={loading}/>
</div>
