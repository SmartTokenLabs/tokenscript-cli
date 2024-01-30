
export function getChainDetails(chainId: number){

	if (!CHAIN_DETAILS[chainId])
		throw new Error("Chain not supported");

	return CHAIN_DETAILS[chainId];
}

export const CHAIN_DETAILS = {
	1: {
		displayName: "Ethereum",
		discoveryName: "eth",
		blockExplorer: ""
	},
	137: {
		displayName: "Polygon",
		discoveryName: "polygon",
		blockExplorer: ""
	},
	11155111: {
		displayName: "Seplolia",
		discoveryName: "sepolia",
		blockExplorer: ""
	},
}
