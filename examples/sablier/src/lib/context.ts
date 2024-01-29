
import {writable} from 'svelte/store';

const data = writable({
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
