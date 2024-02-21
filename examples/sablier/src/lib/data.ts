import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
import {CHAIN_DETAILS, getChainDetails} from "./constants";
import {BigNumber} from "bignumber.js";
import {Contract, JsonRpcProvider, Network} from "ethers";

export async function getAssetDetails(token: ITokenContextData){
	const res = await fetch(`https://api.token-discovery.tokenscript.org/get-fungible-token?collectionAddress=${token.stream.asset}&chain=${getChainDetails(token.chainId).discoveryName}&blockchain=evm`);
	return await res.json();
}

export async function getWithdrawableAmount(token: ITokenContextData){
	const contract = getSablierContract(token);

	const withdrawableAmount = await contract["withdrawableAmountOf"](token.tokenId);

	web3.action.setProps({
		withdrawableAmount
	});

	return withdrawableAmount;
}

function getSablierContract(token: ITokenContextData){

	const network = new Network(CHAIN_DETAILS[chainID].discoveryName, chainID);

	const provider = new JsonRpcProvider(rpcURL, network, {
		staticNetwork: network
	});

	const abi = [
		{
			"inputs": [
				{
					"internalType": "uint256",
					"name": "streamId",
					"type": "uint256"
				}
			],
			"name": "withdrawableAmountOf",
			"outputs": [
				{
					"internalType": "uint128",
					"name": "withdrawableAmount",
					"type": "uint128"
				}
			],
			"stateMutability": "view",
			"type": "function"
		}
	];

	return new Contract(token.contractAddress!!, abi, provider);
}

export function convertDecimals(decimals: number, value: bigint|string|number){
	if (!value)
		return "0";

	if (typeof value !== "string")
		value = value.toString();

	return (new BigNumber(value)).dividedBy(Math.pow(10, decimals)).toString(10);
}

export function convertToIntValue(decimals: number, value: string|number){
	if (!value)
		return 0;

	if (typeof value !== "string")
		value = value.toString();

	const convertedString = new BigNumber(value).multipliedBy(Math.pow(10, decimals)).integerValue().toString(10);

	return BigInt(convertedString);
}

function commify(value) {
	const match = value.match(/^(-?)([0-9]*)(\.?)([0-9]*)$/);
	if (!match || (!match[2] && !match[4])) {
		throw new Error(`bad formatted number: ${ JSON.stringify(value) }`);
	}

	const neg = match[1];
	const whole = BigInt(match[2] || 0).toLocaleString("en-us");
	const frac = match[4] ? match[4].match(/^(.*?)0*$/)[1] : "00";

	return `${ neg }${ whole }.${ frac }`;
}

export function formatAmount(amount: string){

	amount = commify(amount);

	return amount.substring(0, amount.indexOf(".") + 4);
}

/*const ensLookupCache: {[address: string]: string|null} = {};

export async function lookupEnsName(address: string){

	if (ensLookupCache[address])
		return ensLookupCache[address];

	try {
		const res = await fetch(`https://api.token-discovery.tokenscript.org/ens/reverse?address=${address}`);
		const data = await res.json();
		ensLookupCache[address] = data?.ensName ?? null;
	} catch (e){
		ensLookupCache[address] = null;
	}

	return ensLookupCache[address];
}*/
