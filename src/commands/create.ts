import {CliUx, Command, Flags} from '@oclif/core'
import {Templates} from "../create/template";
import {ITemplateData, ITemplateFields, TemplateProcessor} from "../create/templateProcessor";
import * as fs from "fs-extra";
import inquirer from "inquirer";
import {resolve, join} from "path";
import exec from "child_process";
import axios from 'axios';
import { url } from '@oclif/core/lib/parser';
import { XMLSerializer } from '@xmldom/xmldom';
import xmlFormat from 'xml-formatter';

interface ContractLocator {
	chainId: string;
	address: string;
	name: string;
}

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

//TODO: move this out into the build spec file (.env/tsproject.json)
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
	"approve"
];

interface EventContractObject {element?: any, address?: any};
interface EventObject {event?: HTMLElement, contractObject?: EventContractObject};

const polygonScanAPI = 'https://api.polygonscan.com/api?module=contract';
const polygonScanKey = '&apikey=EW1H5FIX1HNIQW59MNXN6N6J7Q6QRQ43EK';

export default class Create extends Command {

	static description = 'Create a new TokenScript project';

	private dir: string = ".";

	private networkId: string = "1";
	private originContract: string = "";
	private contractsFromEvents: EventContractObject[] = [];

	static SRC_XML_FILE = "tokenscript.xml";

	private xmlString?: string|null = null;

	private xmlDoc?: Document ;

	static flags = {
		// can pass either --force or -f
		template: Flags.string({char: "t", options: Templates.templatesList.map((template) => template.id)}),
		hardHat: Flags.string({char: "h"})
	}

	static args = [
		{name: 'directory', default: process.cwd()}
	]

	async catch(error: Error) {
		// do something or
		// re-throw to be handled globally
		throw error;
	}

	async run(): Promise<void> {
		const {flags, args} = await this.parse(Create);


		this.dir = args.directory.indexOf("/") !== 0 ? resolve(process.cwd(), args.directory) : args.directory;

		if (fs.existsSync(this.dir)){

			let numFiles = fs.readdirSync(this.dir).length;

			if (numFiles && fs.existsSync(join(this.dir, "tstemplate.json"))){
				await this.handleExistingProject();
				return;
			}

		} else {
			let proceed = await CliUx.ux.confirm("Create new workspace at " + this.dir + "?");

			if (!proceed){
				return;
			}

			fs.mkdirSync(this.dir, { recursive: true });
		}

		let hardHat = flags.hardHat as string;

		let template = flags.template as string;
		if (!template)
			template = await this.showTemplateSelection();

		let templateDef = Templates.getTemplateDescriptor(template);

		let values = await this.collectFieldValues(templateDef.templateFields);

		CliUx.ux.action.start("Initializing template...");

		Templates.copyTemplate(template, this.dir);

		await this.processTemplateUpdate(templateDef, values);

		CliUx.ux.action.stop();

		// If this is a node-based project, run "npm i" to install dependencies
		if (fs.existsSync(join(this.dir, "package.json"))){
			try {
				CliUx.ux.action.start("Running NPM install...");
				exec.execSync("cd " + this.dir + " && npm i");
			} catch (e: any){
				CliUx.ux.error(e);
				CliUx.ux.info("Failed to run 'npm i', please perform this step manually");
			}
		}

		CliUx.ux.action.stop();
		CliUx.ux.info("Project successfully initialized!\r\n");


		// pull contract address and chain
		let contractABI: any;
		let tokenAddress = this.getContract(values, templateDef);

		if (hardHat) {
			console.log("HardHat: ");
			console.log(hardHat);

			//import ABI from hardhat directory
			//first look for hardhat.config.ts in the dir
			if (!fs.existsSync(join(hardHat, "hardhat.config.ts"))) {
				throw new Error("-h <directory> must point to HardHat project");
			}

			if (!fs.existsSync(join(hardHat, "artifacts", "contracts"))) {
				throw new Error("linked HardHat project must be built");
			}

			let contractABIs: string[] = fs.readdirSync(join(hardHat, "artifacts", "contracts"));

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

						this.start(innerAbi, tokenAddress.address, "Token", tokenAddress.chainId);
					}
				}
			}
		} else {
			// pull contract address and chain
			tokenAddress.address = await this.getLogicAddress(tokenAddress);
			this.networkId = tokenAddress.chainId;
			this.originContract = tokenAddress.address;

			contractABI = await this.getABI(tokenAddress);
			this.start(this.convertABI(contractABI), tokenAddress.address, "Token", tokenAddress.chainId);
		}

		// now process ABI
		console.log("Finish");
	}


	private convertABI(abi: any): any {
        try {
			//let jResult = JSON.parse(abi);
            //return JSON.parse(abi);
			let json = JSON.parse(abi.result);
			return json;
        } catch (e:any) {
			console.log("ERROR, ERROR: ",e.message);
            //abi left empty, proceed but just give the default template
            return JSON.parse("{ }");
        }
    }

	private start(abi: any, contractAddress: string, contractName: string, network: string) {

		var xmlFile: string = "";

		let domParser = new DOMParser();

		let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');

		this.xmlDoc = domParser.parseFromString(xmlFileContent, "application/xml");

		this.setValuesFromABI(abi, xmlFile, contractAddress, contractName);
    }

	private setValuesFromABI(abi: any, xmlFile: string, contractAddress: string, contractName: string) {
        let attributesToAdd = [];
        let eventsToAdd: any[] = [];
		let viewCards = [];
		//console.log("JSON BEGIN: ", abi);
        for(let func of abi) {
            switch(func.type) {
                case Types.FUNCTION:
					if (DoNotGenerate.includes(func.name)) {
						continue;
					}

					switch (func.stateMutability)
					{
						case FunctionTypes.PURE:
						case FunctionTypes.VIEW:
							let attribute = this.getAttribute(func, contractName);
							attributesToAdd.push(attribute);
							break;
						case FunctionTypes.NON_PAYABLE:
						case FunctionTypes.PAYABLE:
							//handle view card
							let viewCard = this.parseFunctionToViewCard(func, contractName);
							//if (viewCard !== "") viewCards.push(viewCard);
							break;
					}
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

		let updatedXML = this.appendToTS(attributesToAdd, eventsToAdd);

		let xmSerializer = new XMLSerializer();
		let serialised = xmSerializer.serializeToString(updatedXML!!);

		let pretty = xmlFormat(serialised);

		fs.writeFileSync(resolve(this.dir, Create.SRC_XML_FILE), pretty);
    }

	private appendToTS(attributes: any[], events: EventContractObject[]): Document {

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
        if(contractObj?.address === this.originContract) return;
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
			let domParser = new DOMParser();
			let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');
			this.xmlDoc = domParser.parseFromString(xmlFileContent, "application/xml");
		}

		return this.xmlDoc;
	}

	private getEventContractObject(contractName: string, contractAddress: string): EventContractObject {
        let eventContractObject: EventContractObject = {};
        let contractObjectFromEvent = this.getDocument().createElement("ts:contract");
        //Can't set the contract name to be the same as the previously declared
        contractObjectFromEvent.setAttribute("name", "contractWithEvent" + contractName);
        let addressNode = this.getDocument().createElement("ts:address");
        addressNode.setAttribute("network", this.networkId);
		addressNode.appendChild(this.getDocument().createTextNode(contractAddress));
        //addressNode.innerText = contractAddress;
        contractObjectFromEvent.appendChild(addressNode);
        eventContractObject.element = contractObjectFromEvent;
        eventContractObject.address = contractAddress;
        return eventContractObject;
    }

	private parseFunctionToAttribute(func: any, contractName: string) {
        //can only handle simple gets without inputs
        if(!DoNotGenerate.includes(func.name)) {
			console.log("Func: ");
			console.log(func.name);
			console.log("---");
			console.log(func);
			return this.getAttribute(func, contractName);
        } else {
            return "";
        }
    }

	private parseFunctionToViewCard(func: any, contractName: string) {
		let data = this.getData(func);
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
		console.log(attributeTypeNode);
        let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");
        //stringNodeName.innerText = func.name;
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

	private getAttribute(func: any, contractName: string) {
        let data = this.getData(func);
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
		console.log(attributeTypeNode);
        let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");
        //stringNodeName.innerText = func.name;
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

	private getData(func: any): HTMLElement {
        let dataElement = this.getDocument().createElement("ts:data");
        if(func.inputs.length !== 0) {
            for(let input of func.inputs) {
				let paramNode = this.getDocument().createElement(`ts:${input.type}`);
				paramNode.setAttribute("ref", input.name);
                dataElement.appendChild(paramNode);
            }
            return dataElement;
        } else {
            return dataElement;
        }
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
		console.log("output: ");
		console.log(outputs);
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

	private async getABI(token: ContractLocator): Promise<any> {
		const urlQuery = polygonScanAPI + '&action=getabi&address=' + token.address + polygonScanKey;
		try {
			const response = await axios.get(urlQuery);
			return response.data;
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}

	// TODO: store contract GUID
	private async getLogicAddress(token: ContractLocator): Promise<any> {
		const urlQuery = polygonScanAPI + '&action=verifyproxycontract&address=' + token.address + polygonScanKey;
		try {
			const response = await axios.post(urlQuery);
			const apiResult: {status: string, message: string, result: string} = response.data;

			//need to pull the guid
			const guid = apiResult.result;
			//now pull result, after 2 second wait
			await this.delay(4000);
			console.log("Call check proxy");
			const contract = await this.finaliseLogicAddress(guid);

			//is it a proxy?
			if (contract.length > 0) {
				return contract;
			}
			else {
				return token.address;
			}
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}

	private async finaliseLogicAddress(guid: string): Promise<any> {
		const urlQuery = polygonScanAPI + '&action=checkproxyverification&guid=' + guid + polygonScanKey;

		try {
			const response = await axios.post(urlQuery);
			const apiResult: {status: string, message: string, result: string} = response.data;
			//need to pull the result
			const rText = apiResult.result;

			//var regexAddr = "(0x[0-9a-fA-F]{40})($|\s?)";
			//const arrayMatch = rText.match(regexAddr);
			//console.log(arrayMatch);

			// TODO: Replace with regex
			const matchBlock = "implementation contract is found at ";
			const index = rText.indexOf(matchBlock) + matchBlock.length;
			var address = "";
			if (index > 0) {
				address = rText.substring(index, index + 42);
			}

			return address;
		} catch (error) {
			console.error(`Error: ${error}`);
		}
	}

	private delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

	getContract(values: any[], templateDef: ITemplateData): ContractLocator {
		const addressIndex = templateDef.templateFields.findIndex((element) => element.token === 'CONTRACT_ADDRESS');
		const chainIndex = templateDef.templateFields.findIndex((element) => element.token === 'CONTRACT_CHAIN');
		const nameIndex = templateDef.templateFields.findIndex((element) => element.token === 'TOKENSCRIPT_NAME');

		const addressVal = values[addressIndex];
		const chainIdVal = values[chainIndex];
		const nameVal = values[nameIndex];
		
		const tokenAddress: ContractLocator = {chainId: chainIdVal, address: addressVal, name: nameVal};

		return tokenAddress;
	}

	private async processTemplateUpdate(templateDef: ITemplateData, values: any[]) {

		let templateProcessor = new TemplateProcessor(templateDef, this.dir);

		await templateProcessor.processTemplateUpdate(values);
	}

	private async handleExistingProject() {

		let templateDef = fs.readJsonSync(this.dir + "/tstemplate.json");

		if (!templateDef)
			throw new Error("Template file is invalid or not readable");

		let proceed = await CliUx.ux.confirm("Existing workspace detected, would you like to try and update template values?\r\nThis may not work correctly, please save your current workspace before continuing");

		if (!proceed)
			return;

		let values = await this.collectFieldValues(templateDef.templateFields);

		await this.processTemplateUpdate(templateDef, values);
	}

	private async showTemplateSelection(){

		let template;

		while (!template){

			let responses: any = await inquirer.prompt([{
				name: 'template',
				message: 'Select project template',
				type: 'list',
				choices: Templates.templatesList.map((template) => {
					return { name:  template.name + ": " + template.description, value: template.id}
				}),
			}]);

			template = responses.template;

			if (!template)
				console.log("\r\nInvalid selection!\r\n");
		}

		return template;
	}

	private async collectFieldValues(templateDef: ITemplateFields[]){

		let responses: any = await inquirer.prompt(templateDef.map((fieldDef) => {

			const type = fieldDef.options?.length ? "list" : "input";
			const choices = fieldDef.options?.length ? fieldDef.options.map((option) => {
				return { name: option, value: option };
			}) : undefined;

			return {
				name: fieldDef.name,
				message: fieldDef.prompt + ":",
				type,
				choices,
				validate: (val) => {
					return val != "";
				}
			};
		}));

		let values: any[] = [];

		for (let i = 0; i < templateDef.length; i++){
			let value = responses[templateDef[i].name];

			if (value == undefined)
				throw new Error("Value not provided");

			values.push(responses[templateDef[i].name]);
		}

		return values;
	}
}

