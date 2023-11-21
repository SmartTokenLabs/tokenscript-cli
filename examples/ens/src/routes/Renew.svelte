<script lang="ts">
	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";
	import { ethers } from "ethers";
	import { TokenInterface, token, updateToken } from "../types/tokenTypes";

	let expiry:string;
	let loading = true;
	let years = 1;
	let renewalPriceWei:number = 0;
	let renewalPriceEth:number = 0;
	let renewalSeconds: any;
	let estimatedGasPriceWei:any = 0;
	let estimatedGasPriceEth:any = 0;
	let evmProvider:any;
	let contract: unknown;
	let maxYears:number = 3;

	const renewABI = [
		{
			"constant": false,
			"inputs": [
				{
					"name": "name",
					"type": "string"
				},
				{
					"name": "duration",
					"type": "uint256"
				}
			],
			"name": "renew",
			"outputs": [],
			"payable": true,
			"stateMutability": "payable",
			"type": "function"
		}
	]

	const ethereumProviderConfig = {
		name: 'ETHEREUM',
    rpc: 'https://nodes.mewapi.io/rpc/eth',
    explorer: 'https://etherscan.com/tx/'
	}

	context.data.subscribe(async (value) => {
		if (!value.token) return;
	
		updateToken(value.token);
		
		expiry = dateToUIDate(token.nameExpires * 1000);

		// You can load other data before hiding the loader
		loading = false;
	});

	function estimateGasPrice () {
		if(evmProvider && ethers && contract && renewalSeconds && token.ensName) {
			// @ts-ignore
			evmProvider.getFeeData().then(({ gasPrice }) => {
				// @ts-ignore
				estimatedGasPriceWei = Number(Math.round(ethers.formatUnits(gasPrice, 'wei'))).toFixed(2);
				estimatedGasPriceEth = estimatedGasPriceWei / 10000000000000;
			})
		}
	}

	function dateToUIDate(dateValue:number):string {
		if(!dateValue) return 'Could not be found';
		const userLocale = navigator.language;
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		return new Date(dateValue).toLocaleDateString(userLocale, options as Intl.DateTimeFormatOptions);
	}

	function updateYearsSelected (increment:boolean) {
		if(increment && years < maxYears) {
			years ++;
		} else if(!increment && years > 1) {
				years --;
		}
		setRenewalYears();
	}

	function setRenewalYears () {
		if(ethers) {
			renewalSeconds = years * 31556952;
			renewalPriceWei = years * token.renewalPricePerYear;
			// @ts-ignore
			renewalPriceEth = Number(ethers.formatEther(renewalPriceWei));
			// @ts-ignore
			web3.action.setProps({renewalSeconds, renewalPriceWei});
			estimateGasPrice();
		}
	}

	function setContractAndProvider () {
		// @ts-ignore
		if(ethers && ethers.JsonRpcProvider) {
			// @ts-ignore
			evmProvider = new ethers.JsonRpcProvider(ethereumProviderConfig.rpc, "mainnet");
			contract = new ethers.Contract("0x283af0b28c62c092c9727f1ee09c02ca627eb7f5", renewABI, evmProvider);
		}
	}

	function init() {
		setRenewalYears();
		setContractAndProvider();
		estimateGasPrice();
	}

	init();

</script>

<div>
	{#if token}
		<div style="margin: 14px 0; display: flex; justify-content: space-between; align-items: center; background-color: white; border-radius: 7px; border: 1px solid rgb(194, 194, 194); height: 142px; width: 100%;">
			<div style="margin: 15px;">
					<h3 style="font-size: 24px;">{token.name}</h3>
					<div style="padding: 0 14px; height: 29px; background-color: #E7F3EF; border-radius: 60px; display: flex; justify-content: center; align-items: center;">
						<div style="color: #1FB184; font-size: 12px;">Valid until: {expiry}</div>
					</div>
			</div>
			<div>
				<img style="width: 104px; margin-top: 4px; margin-right: 15px;" src="{token.image_preview_url}" alt={'image of ' + token.description} />
			</div>
		</div>
		<div style="margin: 14px 0; background-color: white; border-radius: 7px; border: solid #C2C2C2 1px; width: 100%; height: 472px; display: flex; justify-content: space-between; flex-direction: column;">
			<div style="width: 100%;">
					<p style="
						font-size: 19px;
						font-weight: 500;
						text-align: center;
						">Extend Name</p>
			</div>
			<div style="display: flex; justify-content: center; flex-direction: column; align-items: center;">
					<div style="height: 69px; border-radius: 60px; display: flex; justify-content: space-between; align-items: center; background-color: white; border: solid #C2C2C2 1px; width: 320px;">
						<button class="years-selection-btn" on:click={() => { updateYearsSelected(false)}} style="background-color: #C2C2C2; border-radius: 38px; height: 58px; width: 58px; margin: 5px; text-align: center; border: none; cursor: pointer;">-</button>
						<div style="
								font-weight: 500;
								">{years > 1 ? years + ' Years' : years + ' Year' }</div>
						<button class="years-selection-btn" on:click={() => { updateYearsSelected(true)}} style="background-color: #3888FF; border-radius: 38px; color: white; height: 58px;width: 58px; margin: 5px; text-align: center; cursor: pointer; border: none;">+</button>
					</div>
					<div style="background-color: #F5F5F5; width: 310px; height: 200px; border-radius: 20px; margin: 52px; padding: 24px;">
						<div style="color: #B6B6BF; display: flex; justify-content: space-between">
								<p>{years > 1 ? years + ' years' : years +' year' } extension</p>
								<p>{renewalPriceEth.toFixed(4)} ETH</p>
						</div>
						<div style="color: #B6B6BF; display: flex; justify-content: space-between">
								<p>Transaction </p>
								<p>{estimatedGasPriceEth.toFixed(4)} ETH</p>
						</div>
						<div style="color: black;display: flex; justify-content: space-between">
								<p>Estimated total</p>
								<p>{(renewalPriceEth + estimatedGasPriceEth).toFixed(4) } ETH</p>
						</div>
					</div>
			</div>
		</div>
	{/if}
	<Loader show={loading}/>
</div>

		