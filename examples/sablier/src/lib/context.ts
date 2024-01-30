import type {ITokenContextData} from "@tokenscript/card-sdk/dist/types";
import {writable} from 'svelte/store';

const data = writable(<{token: null|ITokenContextData}>{
	token: null
});

function setToken(token){
	data.set({
		...data,
		token
	});
}

export default {
	data,
	setToken,
}
