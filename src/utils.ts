// Util functions copied from attestation JS library

import {existsSync, readFileSync} from "fs";
import {join} from "path";

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

export function uint8tohex(uint8: Uint8Array): string {
	if (!uint8 || !uint8.length) return '';
	return Array.from(uint8).map(i => ('0' + i.toString(16)).slice(-2)).join('');
}

export function decode(key: string, cyphertextB64: string) {
	try {
		const buffer = Buffer.from(cyphertextB64, 'base64');
		const cyphertext = buffer.toString('hex');
		let parsed = cyphertext.match(/.{1,2}/g)!.map(x => parseInt(x, 16));
		let plaintext = [];
		for (let i = 0; i < parsed.length; i++) {
			plaintext.push((parsed[i] ^ key.charCodeAt(Math.floor(i % key.length))).toString(16).padStart(2, '0'));
		}
		return decodeURIComponent('%' + plaintext.join('').match(/.{1,2}/g)!.join('%'));
	}
	catch(e) {
		return false;
	}
}

export function encode(key: string, plaintext: string) {
	let cyphertext = [];
	// Convert to hex to properly handle UTF8
	let convert = Array.from(plaintext).map(function(c) {
		if(c.charCodeAt(0) < 128) return c.charCodeAt(0).toString(16).padStart(2, '0');
		else return encodeURIComponent(c).replace(/\%/g,'').toLowerCase();
	}).join('');
	// Convert each hex to decimal
	let stripped = convert.match(/.{1,2}/g)?.map(x => parseInt(x, 16));
	// Perform xor operation
	for (let i = 0; i < plaintext.length; i++) {
		cyphertext.push(stripped![i] ^ key.charCodeAt(Math.floor(i % key.length)));
	}
	// Convert to hex
	cyphertext = cyphertext.map(function(x) {
		return x.toString(16).padStart(2, '0');
	});
	return hexToBase64(cyphertext.join(''));
}

//Can this be done with a library function?
function hexToBase64(hexstring: string) {
	const matcher = hexstring.match(/\w{2}/g);
	return btoa(matcher!.map(function(a) {
		return String.fromCharCode(parseInt(a, 16));
	}).join(""));
}

export function isAddress(address: string) {
	return (/^(0x)?[0-9a-f]{40}$/i.test(address));
    /*if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
    } else {
		return true;
	}*/
}

export function useTokenscriptBuildCommand(projectDir: string){

	const path = join(projectDir, "package.json");

	if (existsSync(path)){
		const packageJson = JSON.parse(readFileSync(path, "utf8"));

		if (!!packageJson.scripts["ts:buildWeb"])
			return true;

		return !packageJson.scripts["ts:build"];
	}

	return true
}

export function hasWebBuildCommand(projectDir: string){
	const path = join(projectDir, "package.json");

	if (existsSync(path)){
		const packageJson = JSON.parse(readFileSync(path, "utf8"));
		return !!packageJson.scripts["ts:buildWeb"];
	}

	return false;
}
