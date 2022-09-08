// Util functions copied from attestation JS library

export function hexStringToArray(str: string = '') {
	if (str.substr(0,2).toLowerCase() === "0x") {
		str = str.substr(2);
	}
	let arr = [];
	let strArr = [...str];
	if (strArr.length % 2) strArr.unshift('0');
	let tempStr = '';
	if (!strArr || typeof strArr == "undefined" || !strArr.length) return [];

	let tmpVal:number;

	while (strArr.length) {
		tempStr = '';
		// @ts-ignore
		tempStr += strArr.shift() + strArr.shift();
		tmpVal = parseInt(tempStr,16);
		if (isNaN(tmpVal)) {
			throw new Error("hexStringToArray input is not a hex string.");
		}
		arr.push(tmpVal);
	}
	return arr;
}

export function hexStringToUint8(str: string = '') {
	return Uint8Array.from(hexStringToArray(str));
}

export function hexStringToBase64(str: string = ''): string {
	return uint8arrayToBase64(hexStringToUint8(str));
}

export function uint8arrayToBase64( bytes: Uint8Array ): string {

	let binary = uint8toString(bytes);

	if (typeof window === 'undefined' || !window.btoa) {
		let buff = new Buffer(binary);
		return buff.toString('base64');
	} else {
		return window.btoa( binary );
	}
}

export function uint8toString(uint8: Uint8Array): string {
	if (!uint8) return '';
	let binary = '';
	let len = uint8.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode( uint8[ i ] );
	}
	return binary;
}

export function hexStringToBase64Url(str: string = ''): string {
	return base64toBase64Url(uint8arrayToBase64(hexStringToUint8(str)))
}

export function base64toBase64Url(base64: string): string {
	return base64.split('/').join('_')
		.split('+').join('-');
	// .split('=').join('.');
}
