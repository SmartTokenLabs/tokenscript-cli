import {Templates} from "../create/template";
import {ITemplateData, ITemplateFields, TemplateProcessor} from "../create/templateProcessor";
import * as fs from "fs-extra";
import {resolve, join} from "path";
import { XMLSerializer } from '@xmldom/xmldom';
import xmlFormat from 'xml-formatter';
import Create from '../commands/create'
import {ContractLocator} from "../commands/create";
import axios from 'axios';
import {decode, isAddress} from '../utils';
import {JSDOM} from "jsdom";

interface EventContractObject {element?: any, address?: any};
interface EventObject {event?: HTMLElement, contractObject?: EventContractObject};

const Types = {
	FUNCTION: "function",
	TUPLE: "tuple",
	EVENT: "event"
};

const FunctionTypes = {
	NON_PAYABLE: "nonpayable",
	VIEW: "view",
	PURE: "pure",
	PAYABLE: "payable"
};

//TODO: move this out into the build spec file (.env or tstemplate.json)
const DoNotGenerate: string[] = [
	"balanceOf",
	"isApprovedForAll",
	"name",
	"ownerOf",
	"symbol",
	"scriptURI",
	"supportsInterface",
	"tokenByIndex",
	"tokenOfOwnerByIndex",
	"tokenURI",
	"approve",
	"safeTransferFrom",
	"setScriptURI",
	"transferFrom",
	"transferOwnership",
	"renounceOwnership",
	"setApprovalForAll"
];

//Remove whitespace from the following elements
//Note that the XML beautifier will add spaces and CR/LF
const StripWhitespace: string[] = [
	"ts:address",
    "ts:syntax"
];

//These are special types; remove the underscores from these types
const AbbreviateTypes: string[] = [
    "tokenId"
]

const DisallowedTypes: string[] = [
    "tuple"
];

interface ScanAPIRoute {
    api: string,
    key: string
}

const scanAPIs: ScanAPIRoute[] = [];

const whitespaceRegex = /^[\s\r\n]*$/;
const whitespaceStrip = /[\s\r\n]+/g;

export default class ABIToScript {

	private xmlDoc?: Document ;

    private contractsFromEvents: EventContractObject[] = [];

	private domParser: DOMParser;

    constructor(
		private dir: string,
        private tokenAddress: ContractLocator
	) {
		const dom = new JSDOM("");
		const DOMParser = dom.window.DOMParser;
		this.domParser = new DOMParser;
	}

    async initFromHardHat(hardHat: string, contractABIs: string[]) {
		//import ABI from hardhat directory
		for (let i = 0; i < contractABIs.length; i++) {
			let contractDir = contractABIs[i];
			let abiFiles: string[] = fs.readdirSync(join(hardHat, "artifacts", "contracts", contractDir));

			for (let j = 0; j < abiFiles.length; j++) {
				let abiFile = abiFiles[j];
				console.log("abiFiles: %s", abiFile);
				if (abiFile.includes(".dbg.json")) {
					console.log("Skip: %s", abiFile);
				} else if (abiFile.endsWith(".json")) {
					console.log("Adding: %s", abiFile);
					//got our ABI file
					let abiFileContent = fs.readFileSync(join(hardHat, "artifacts", "contracts", contractDir, abiFile), "utf-8");
					let json = JSON.parse(abiFileContent);
					let innerAbi = json["abi"];

					await this.start(innerAbi, "Token");
				}
			}
		}
	}

	convertABI(abi: any): any {
        try {
			return JSON.parse(abi.result);
        } catch (e:any) {
            //abi left empty, proceed but just give the default template
            return JSON.parse("{ }");
        }
    }

	async start(abi: any, contractName: string) {

		let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');

		this.xmlDoc = this.domParser.parseFromString(xmlFileContent, "application/xml");

		await this.setValuesFromABI(abi, contractName);
    }

    getABIFetchOption(templateDef: ITemplateFields[], values: any[]): boolean {
        const abiFetchIndex = templateDef.findIndex((element) => element.token === '__PULL_ABI');
        let val = values[abiFetchIndex];
        return val === 'yes';
    }

	private async setValuesFromABI(abi: any, contractName: string) {
        let attributesToAdd = [];
        let eventsToAdd: any[] = [];
		let viewCards = [];
        for(let func of abi) {
            switch(func.type) {
                case Types.FUNCTION:
					let [attr, viewCard] = await this.handleFunction(func, contractName);
					if (attr !== "") attributesToAdd.push(attr);
					if (viewCard !== "") viewCards.push(viewCard);
					break;
                case Types.EVENT:
                    //let event: EventObject = this.getEvent(func.name, contractName, contractAddress, func);
                    //eventsToAdd.push(event.event);
                    //this.addEventContractObj(event.contractObject);
                    break;
                case Types.TUPLE:
                    break;
            }
        }

		let updatedXML = this.appendToTS(attributesToAdd, eventsToAdd, viewCards);

		let xmSerializer = new XMLSerializer();
		let serialised = xmSerializer.serializeToString(updatedXML!!);
		let pretty = xmlFormat(serialised);

        //remove whitespace from ts:addresses, ts:syntax
        let tsNode = this.domParser.parseFromString(pretty, 'text/xml');
        this.postParse(tsNode);

        //back to string again
        pretty = xmSerializer.serializeToString(tsNode);

		fs.writeFileSync(resolve(this.dir, Create.SRC_XML_FILE), pretty);
    }

    // Remove whitespace from nodes enclosed within the tags in StripWhitespace
    // The TS engine is sensitive to whitespace in those places
    // TODO: Strip whitespace from around addresses and descriptive elements that aren't expected to contain WS in TS engine
    postParse(xmlDoc: Node) {
		let child = xmlDoc.firstChild;
        let rootName = xmlDoc.nodeName;

		while (child) {
			let nextChild = child.nextSibling;
			if (child.nodeType === 3 && StripWhitespace.includes(rootName)) {
                if (whitespaceRegex.test(child.nodeValue!)) {
                    xmlDoc.removeChild(child);
                } else {
                    child.textContent = child.nodeValue!.replace(whitespaceStrip, '');
                }
			} else if (child.nodeType === 1) {
                this.postParse(child);
			}

			child = nextChild;
		}
	}

	private async handleFunction(func: any, contractName: string): Promise<[any, any]> {
		if (!DoNotGenerate.includes(func.name)) {
			switch (func.stateMutability) {
				case FunctionTypes.PURE:
				case FunctionTypes.VIEW:
					let attribute = this.getAttribute(func, contractName);
					return [attribute, ""];
				case FunctionTypes.NON_PAYABLE:
				case FunctionTypes.PAYABLE:
					let viewCard = await this.parseFunctionToViewCard(func, contractName);
					return ["", viewCard];
			}
		}

		return ["", ""];
	}

	private appendToTS(attributes: any[], events: EventContractObject[], viewCards: any[]): Document {

		for (let viewCard of viewCards) {
			this.xmlDoc!!.getElementsByTagName("ts:cards")[0].appendChild(viewCard);
		}

        for(let attribute of attributes) {
            this.xmlDoc!!.getElementsByTagName("ts:token")[0].appendChild(attribute);
        }
        /*for(let event of events) {
            parsedXml.getElementsByTagName("ts:token")[0].insertBefore(event.element, parsedXml.getElementsByTagName("ts:label")[0]);
        }
        for(let contract of this.contractsFromEvents) {
            parsedXml.getElementsByTagName("ts:token")[0].insertBefore(contract.element, parsedXml.getElementsByTagName("ts:contract")[0]);
        }*/
        return this.xmlDoc!!;
    }

	private getEvent(eventName:string, contractName: string, contractAddress:string, eventABI:any): EventObject {
        let eventObject: EventObject = { };
        let eventParams = this.getEventParams(eventABI);
        let moduleNode = document.createElement("asnx:module");
        moduleNode.setAttribute("name", contractName + "-event-" + eventName);
        let namedTypeNode = document.createElementNS(null, "namedType");
        namedTypeNode.setAttribute("name", eventName);
        let typeNode = document.createElement("type");
        let sequenceNode = document.createElement("sequence");
        eventParams.map((eventParam) => {
            sequenceNode.appendChild(eventParam);
        });
        typeNode.appendChild(sequenceNode);
        namedTypeNode.appendChild(typeNode);
        moduleNode.appendChild(namedTypeNode);
        eventObject.event = moduleNode;
        eventObject.contractObject = this.getEventContractObject(contractName, contractAddress);
        return eventObject;
    }

	private addEventContractObj(contractObj?: EventContractObject) {
        //if event is sourced from the TS contract, there is no need to add it again
        if(contractObj?.address === this.tokenAddress.address) return;
        for(let contract of this.contractsFromEvents) {
            if(contract.address === contractObj?.address) {
                //contract already included
                return;
            }
        }
		if (contractObj != null)
		{
        	this.contractsFromEvents.push(contractObj);
		}
    }

	private getEventParams(eventAbi:any) {
        let eventParams = [];
        for(let eventInput of eventAbi.inputs) {
            let elementNode = document.createElement("element");
            elementNode.setAttribute("name", eventInput.name);
            elementNode.setAttribute("ethereum:type", eventInput.type);
            elementNode.setAttribute("ethereum:indexed", eventInput.indexed);
            eventParams.push(elementNode);
        }
        return eventParams;
    }

	private getDocument() {
		if (!this.xmlDoc) {
			let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');
			this.xmlDoc = this.domParser.parseFromString(xmlFileContent, "application/xml");
		}

		return this.xmlDoc;
	}

	private getEventContractObject(contractName: string, contractAddress: string): EventContractObject {
        let eventContractObject: EventContractObject = {};
        let contractObjectFromEvent = this.getDocument().createElement("ts:contract");
        //Can't set the contract name to be the same as the previously declared
        contractObjectFromEvent.setAttribute("name", "contractWithEvent" + contractName);
        let addressNode = this.getDocument().createElement("ts:address");
        addressNode.setAttribute("network", this.tokenAddress.chainId.toString());
		addressNode.appendChild(this.getDocument().createTextNode(contractAddress));
        //addressNode.innerText = contractAddress;
        contractObjectFromEvent.appendChild(addressNode);
        eventContractObject.element = contractObjectFromEvent;
        eventContractObject.address = contractAddress;
        return eventContractObject;
    }

	//1. Add card spec
	private async parseFunctionToViewCard(func: any, contractName: string) {
		let [data, valid] = this.getData(func);
        if (!valid) { //can't handle this card transaction type yet (tuple or array type)
            return "";
        }
        let card = this.getDocument().createElement("ts:card");
		card.setAttribute("type", "action");
		let nameAttr = this.getDocument().createAttribute("name");
		nameAttr.value = func.name;
		card.attributes.setNamedItem(nameAttr);

		//label
		let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");

		stringNodeName.appendChild(this.getDocument().createTextNode(func.name))
        nameNode.appendChild(stringNodeName);
        card.appendChild(nameNode);

		if (func.stateMutability == FunctionTypes.PAYABLE) {
			let originElement = this.getDocument().createElement("ts:user-entry");
			originElement.setAttribute("as", "e18");
			let varAttribute = this.formatAttribute("uint256", "valAmount", originElement);
			card.appendChild(varAttribute);
		}

		//transaction
		let transactionNode = this.getDocument().createElement("ts:transaction");
        let ethereumNode = this.getDocument().createElement("ethereum:transaction");
        ethereumNode.setAttribute("function", func.name);
        ethereumNode.setAttribute("contract", contractName);
        let AS = this.getAS(func.outputs);
        if(AS !== "") {
            ethereumNode.setAttribute("as", AS);
        } else {
            //do not include as
        }
        ethereumNode.appendChild(data);

		if (func.stateMutability == FunctionTypes.PAYABLE) {
			let valueRef = this.getDocument().createElement("ethereum:value");
			valueRef.setAttribute("ref", "valAmount");
			ethereumNode.appendChild(valueRef);
		}

		transactionNode.appendChild(ethereumNode);
		card.appendChild(transactionNode);

		//view
		let viewNode = this.getDocument().createElement("ts:view");
		viewNode.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
		let viewAttr = this.getDocument().createAttribute("xml:lang");
		viewAttr.value = "en";
		viewNode.attributes.setNamedItem(viewAttr);

		let viewContent = this.getDocument().createElement("ts:viewContent");
		viewContent.setAttribute("name", "common");
		let viewInclude = this.getDocument().createElement("ts:include");
		viewInclude.setAttribute("type", "html");
		let includeAttr = this.getDocument().createAttribute("src");
		includeAttr.value = "./" + func.name + ".html";
		viewInclude.attributes.setNamedItem(includeAttr);

		viewNode.appendChild(viewContent);
		viewNode.appendChild(viewInclude);

		card.appendChild(viewNode);

		//now create the file
		//each card needs a view
		let fName = func.name + ".html";
		switch (func.stateMutability) {
			case FunctionTypes.PAYABLE:
				fs.copyFileSync("payable-card.html", fName);
				break;
			case FunctionTypes.NON_PAYABLE:
				fs.copyFileSync("non-payable-card.html", fName);
				break;
		}

		//do a parse on the new file
		let templateDef = Templates.getCardTemplate();
		//templateDef.templateFields[0].value = func.name;

		await this.processTemplateCard(templateDef, func.name, fName);

        return card;
	}

	private formatAttribute(typeName: string, name: string, originsElement: any) {
		let attributeTypeNode = this.getDocument().createElement("ts:attribute");
		attributeTypeNode.setAttribute("name", name);
		let type = this.getDocument().createElement("ts:type");
		let syntaxElement = this.getDocument().createElement("ts:syntax");
        let syntax = this.getOutputSyntax(typeName);
		if(syntax !== "") {
			syntaxElement.appendChild(this.getDocument().createTextNode(syntax));
        }
		type.appendChild(syntaxElement);
		attributeTypeNode.appendChild(type);
		let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");
		stringNodeName.appendChild(this.getDocument().createTextNode(name))
        nameNode.appendChild(stringNodeName);
        attributeTypeNode.appendChild(nameNode);

		let originNode = this.getDocument().createElement("ts:origins");
		originNode.appendChild(originsElement);
		attributeTypeNode.appendChild(originNode);

        return attributeTypeNode;
	}

	private getAttribute(func: any, contractName: string) {
        let [data, valid] = this.getData(func);
        if (!valid) { //can't handle this attribute yet (tuple or array type)
            return "";
        }
        let attributeTypeNode = this.getDocument().createElement("ts:attribute");
        attributeTypeNode.setAttribute("name", func.name);
        let type = this.getDocument().createElement("ts:type");
        let syntaxElement = this.getDocument().createElement("ts:syntax");
        let syntax = this.getSyntax(func.outputs);
        if(syntax !== "") {
			syntaxElement.appendChild(this.getDocument().createTextNode(syntax));
        }
        type.appendChild(syntaxElement);
        attributeTypeNode.appendChild(type);
        let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");
		stringNodeName.appendChild(this.getDocument().createTextNode(func.name))
        nameNode.appendChild(stringNodeName);
        attributeTypeNode.appendChild(nameNode);
        let originNode = this.getDocument().createElement("ts:origins");
        let ethereumNode = this.getDocument().createElement("ethereum:call");
        ethereumNode.setAttribute("function", func.name);
        ethereumNode.setAttribute("contract", contractName);
        let AS = this.getAS(func.outputs);
        if(AS !== "") {
            ethereumNode.setAttribute("as", AS);
        } else {
            //do not include as
        }
        ethereumNode.appendChild(data);
        originNode.appendChild(ethereumNode);
        attributeTypeNode.appendChild(originNode);
        return attributeTypeNode;
    }

	private getData(func: any): [dataElement: HTMLElement, valid: boolean] {
        let dataElement = this.getDocument().createElement("ts:data");
        var valid: boolean = true;
        if(func.inputs.length !== 0) {
            for(let input of func.inputs) {
				let paramNode = this.getDocument().createElement(`ts:${input.type}`);
				paramNode.setAttribute("ref", this.parseInputName(input.name));
                dataElement.appendChild(paramNode);
                if (valid) {
                    valid = this.checkValidity(input.type);
                }
            }
            return [dataElement, valid];
        } else {
            return [dataElement, valid];
        }
    }

    // If this is a special name like _tokenId, replace with tokenId so that the TS engine will pick this up correctly.
    private parseInputName(inputName: string): string {
        let testInputName = inputName.replace(/^_+/, '');
        if (AbbreviateTypes.includes(testInputName)) {
            return testInputName;
        } else {
            return inputName;
        }
    }

    private checkValidity(type: string): boolean {
        DisallowedTypes.forEach(tp => {
            if (type.startsWith(tp)) {
                return false;
            };
        });

        //disallowed
        if (type.endsWith("[]")) {
            return false;
        }

        return true;
    }

	//TODO make into a comprehensive switch statement with enum
    private getAS(outputs: any[]) {
        if(outputs.length == 0) {
            return "";
        } else {
            let ethType = outputs[0].type;
            if(ethType.includes("uint")) {
                return "uint";
            } else if(ethType.includes("byte")) {
                return "bytes";
            } else if(ethType.includes("string")) {
                return "utf8";
            } else if(ethType.includes("address")) {
                return "address";
            } else {
                return "";
            }
        }
    }

	private getSyntax(outputs: any[]) {
        if(outputs.length == 0) {
            return "";
        } else if(outputs[0].type.includes("uint") || outputs[0].type.includes("int")) {
            return "1.3.6.1.4.1.1466.115.121.1.36";
        } else if(outputs[0].type.includes("string")) {
            return "1.3.6.1.4.1.1466.115.121.1.26";
        } else if(outputs[0].type.includes("byte")) {
            return "1.3.6.1.4.1.1466.115.121.1.6";
        } else {
            return "1.3.6.1.4.1.1466.115.121.1.15";
        }
    }

	private getOutputSyntax(outputType: any) {
		if(outputType.includes("uint") || outputType.includes("int")) {
            return "1.3.6.1.4.1.1466.115.121.1.36";
        } else if(outputType.includes("string")) {
            return "1.3.6.1.4.1.1466.115.121.1.26";
        } else if(outputType.includes("byte")) {
            return "1.3.6.1.4.1.1466.115.121.1.6";
        } else {
            return "1.3.6.1.4.1.1466.115.121.1.15";
        }
    }

    private async processTemplateCard(templateDef: ITemplateData, value: string, file: any) {
		let values:any[] = [];
		values.push(value);
		let templateProcessor = new TemplateProcessor(templateDef, this.dir);
		await templateProcessor.replaceInFiles(values, [file]);
	}


    //
    //
    // Etherscan
    //
    //
    async getABI(token: ContractLocator): Promise<any> {
        this.setupAPIRoutes();
        let [apiRoute, keySuffix] = this.getAPIValues(token);

		const urlQuery = apiRoute + '&action=getabi&address=' + token.address + keySuffix;

        if (keySuffix.length == 0) {
            this.delay(5000); // 5000ms delay if no API key
        }

		try {
			const response = await axios.get(urlQuery);
			return response.data;
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}

    private getAPIValues(token: ContractLocator) {
        let apiValue: ScanAPIRoute = scanAPIs[token.chainId];
        let keySuffix = "";
        if (apiValue.key.length > 0) {
            keySuffix = "&apikey=" + decode(apiValue.api, apiValue.key);
        }

        return [apiValue.api, keySuffix];
    }

	// TODO: store contract GUID in the tstemplate file
	async getLogicAddress(token: ContractLocator): Promise<string> {
        this.setupAPIRoutes();
        let [apiRoute, keySuffix] = this.getAPIValues(token);

		const urlQuery = apiRoute + '&action=verifyproxycontract&address=' + token.address + keySuffix;
		try {
			const response = await axios.post(urlQuery);
			const apiResult: {status: string, message: string, result: string} = response.data;

			//need to pull the guid
			const guid = apiResult.result;
			//now pull result, after 4 second wait for database update
			await this.delay(5000);
			return await this.finaliseLogicAddress(guid, apiRoute, keySuffix, token.address);
		} catch (error) {
			// No need to report failure
		}

        return token.address;
	}

	private async finaliseLogicAddress(guid: string, apiRoute: string, keySuffix: string, tokenAddress: string): Promise<string> {
		const urlQuery = apiRoute + '&action=checkproxyverification&guid=' + guid + keySuffix;

		try {
			const response = await axios.post(urlQuery);
			const apiResult: {status: string, message: string, result: string} = response.data;
			//need to pull the result
			const rText = apiResult.result;

			//var regexAddr = "(0x[0-9a-fA-F]{40})($|\s?)";
			//const arrayMatch = rText.match(regexAddr);
			//console.log(arrayMatch);

			// TODO: Replace with regex to pull address out
            const addrIndex = rText.lastIndexOf("0x");
            // check if valid address
            if (addrIndex > 0) {
                const testAddress = rText.substring(addrIndex, addrIndex + 42);
                if (isAddress(testAddress)) {
                    tokenAddress = testAddress;
                }
            }

			return tokenAddress;
		} catch (error) {
			// No need to report failure
		}

        return tokenAddress;
	}

	private delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

    //set up keys
    setupAPIRoutes() {
        //TODO: read API keys from .env file
        //TODO: Add more routes
        scanAPIs[1] = { api: "https://api.etherscan.io/api?module=contract", key: "Oy4zQ0ACdRw7PSR8NyAlUkUrJDgjdD84ZVcyI2U/VyZGOQ==" };
        scanAPIs[137] = { api: "https://api.polygonscan.com/api?module=contract", key: "EW1H5FIX1HNIQW59MNXN6N6J7Q6QRQ43EK" };
        scanAPIs[80001] = { api: "https://api-testnet.polygonscan.com/api?module=contract", key: "EW1H5FIX1HNIQW59MNXN6N6J7Q6QRQ43EK" };
        scanAPIs[11155111] = { api: "https://api-sepolia.etherscan.io/api?module=contract", key: "Oy4zQ0ACdRw7PSR/ITE9WFsxJncoLj4yOEUhKzR8US0cNA==" };
        scanAPIs[17000] = { api: "https://api-holesky.etherscan.io/api?module=contract", key: "Oy4zQ0ACdRw7PSR/OjshUkQzPncoLj4yOEUhKzR8US0cNA==" };
    }
}
