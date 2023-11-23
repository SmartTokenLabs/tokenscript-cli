
<script lang="ts">
	import context from "../lib/context";
	import Loader from "../components/Loader.svelte";
	import { ethers } from "ethers";
	import { chainConfig } from './../utils/index';

	let token: any;
	let loading = true;
	let collectionName:string;
	let creatorRoyaltiesForSale: number;

	context.data.subscribe(async (value) => {
		if (!value.token)
			return;
		token = value.token;

		init();

		// You can load other data before hiding the loader
		loading = false;
	});

	function setCollectionName () {
		if(token.name.includes("#")) {
			collectionName = token.name.substring(0, token.name.indexOf("#"));
		} else {
			collectionName = token.name
		}
	}
	
	function setTokenId () {
		// @ts-ignore
		web3.action.setProps({ tokenId: token.tokenId });
	}

	async function checkCalculateRoyalty() {

		const rpc = chainConfig[Number(token.chainId)]?.rpc;

		if(!rpc) return;

		const provider = new ethers.JsonRpcProvider(rpc);
		const contract = new ethers.Contract(token.contractAddress, [
		{
			"constant": true,
			"name": "royaltyInfo",
			"inputs": [
				{
					"internalType": "uint256",
					"name": "tokenId",
					"type": "uint256"
				},
				{
					"internalType": "uint256",
					"name": "salePrice",
					"type": "uint256"
				}
			],
			"outputs": [
					{
							"internalType": "address",
							"name": "receiver",
							"type": "uint256"
					},
					{
							"internalType": "uint256",
							"name": "royaltyAmount",
							"type": "uint256"
					}
			],
			"stateMutability": "view",
			"type": "function"
		}
		], provider);

		const calculateRoyalty = await contract.royaltyInfo(4275773203, 100);
		if(calculateRoyalty[1]) creatorRoyaltiesForSale = calculateRoyalty[1];
	}

	function setRoyalties () {
		// if(ethers && token.royaltyInfo) {} // for handling via TS
		checkCalculateRoyalty(); // Ethers
	}

	function init () {
		setCollectionName();
		setTokenId();
		setRoyalties();
	}

</script>

<div style="background-color: #86c7ee; padding: 20px; border-radius: 6px;">
	<!-- 
		example hero image
		<img style="width:100%; border-radius: 7px;" src="https://coolcats.com/images/og-image.png" alt={'hero image'} /> 
	-->
	{#if token.external_link_open_graph_image}
		<img style="width:100%; border-radius: 7px;" src={token.external_link_open_graph_image} alt={'hero image'} />
	{/if}
	{#if token}
		<div style="margin: 14px 0px 18px 0; display: flex; justify-content: space-between; align-items: center; background-color: white; border-radius: 7px; height: 142px; width: 100%;">
			<div style="margin: 15px; width: 50%;">
					<h3 style="font-size: 18px; margin-bottom: 7px; word-wrap: break-word;">{token.name}</h3>
					<p style="color: #989898; margin: 0; font-size: 14px">{collectionName} Collection</p>
			</div>
			<div>
				<img id="token-image" style="border-radius: 7px; width: 98px; margin-top: 5px; margin-right: 15px;" src="{token.image_preview_url}" alt={'image of ' + token.description} />
			</div>
		</div>
		<div style="background-color: white; border-radius: 7px; width: 100%; display: flex; justify-content: space-between; flex-direction: column; padding: 0 18px;">
			<div style="width: 100%;">
					<p style="
						font-size: 19px;
						font-weight: 500;
						text-align: center;
						margin: 38px 0 14px 0;
						">Info</p>
			</div>
			{#if token?.tokenInfo?.attributes}
				<div style="margin-bottom: 18px; background-color: #F5F5F5; color: #989898; font-weight: 300; border-radius: 20px; padding: 12px 22px;">
					<p style="color: #888; font-weight: 600;">Traits</p>
					<div style="display: flex; justify-content: center; align-items: baseline; flex-direction: row; flex-wrap: wrap;">
					
					{#each token?.tokenInfo?.attributes as trait}
						<div style="margin-right: 18px; margin-bottom: 18px; width: 148px; background-color: white; font-size: 12px; text-align: center; border-radius: 20px; font-weight: 300; padding: 12px;">
							<p style="font-weight: 600; color: #777;">{trait.trait_type}</p>
							<p style="font-weight: 300; color: #777;">{trait.value}</p>
							<p style="font-weight: 300; color: #ff0086e0">{trait.rarity ? trait.rarity : '(rarity percentage unknown)'}</p>
						</div>
					{/each}
					</div>
				</div>
			{/if}				
			<div style="margin-bottom: 18px; background-color: #F5F5F5; border-radius: 20px; font-weight: 300; padding: 24px;">
				{#if token.description}
					<p style="color: #888; font-weight: 600;">Description</p>
					<p style="color: #888; word-wrap: break-word;">{token.description}</p>
				{/if}				
				{#if token.contractAddress}
					<p style="color: #888; font-weight: 600;">Contract</p>
					<p style="color: #888; word-wrap: break-word;">{token.contractAddress}</p>
				{/if}
				{#if token.tokenInfo.type}
					<p style="color: #888; font-weight: 600;">Token Standard </p>
					<p style="color: #888;">{token.tokenInfo.type}</p>
				{/if}
				{#if token.chainId}
					<p style="color: #888; font-weight: 600;">Chain</p>
					<p style="color: #888; word-wrap: break-word;">{token.chainId}</p>
				{/if}
				{#if token.symbol}
					<p style="color: #888; font-weight: 600;">Symbol</p>
					<p style="color: #888; word-wrap: break-word;">{token.symbol}</p>
				{/if}				
				{#if creatorRoyaltiesForSale}
					<p style="color: #888; font-weight: 600;">Creator Earnings Per Sale</p>
					<p style="color: #888; word-wrap: break-word;">{ creatorRoyaltiesForSale+'%' }</p>
				{/if}
				{#if token.external_link}
					<p style="color: #888; font-weight: 600;">Website</p>
					<p style="color: #888; word-wrap: break-word;">{token.external_link}</p>
				{/if}
			</div>
		</div>
	{/if}
	<Loader show={loading}/>
</div>



			