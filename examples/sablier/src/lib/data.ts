import {Contract, JsonRpcProvider, Network} from "ethers";

const ensLookupCache: {[address: string]: string|null} = {};

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
}
