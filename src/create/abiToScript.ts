import { Templates } from "../create/template";
import { ITemplateData, ITemplateFields, TemplateProcessor } from "../create/templateProcessor";
import * as fs from "fs-extra";
import { resolve, join } from "path";
import { XMLSerializer } from '@xmldom/xmldom';
import xmlFormat from 'xml-formatter';
import Create from '../commands/create'
import { ContractLocator } from "../commands/create";
import axios from 'axios';
import { decode, isAddress } from '../utils';
import { JSDOM } from "jsdom";
import inquirer from "inquirer";
import { CliUx } from '@oclif/core'

interface EventContractObject { element?: any, address?: any };
interface EventObject { event?: HTMLElement, contractObject?: EventContractObject };

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

const TSType = {
    ATTRIBUTE: "Attributes",
    CARD: "Cards"
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
];

const DisallowedTypes: string[] = [
    "tuple"
];

interface ScanAPIRoute {
    api: string,
    key: string
}

interface ScannedFunction {
    name: string,
    outputType: string
}

const scanAPIs: ScanAPIRoute[] = [];

const whitespaceRegex = /^[\s\r\n]*$/;
const whitespaceStrip = /[\s\r\n]+/g;

export default class ABIToScript {

    private xmlDoc?: Document;

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
                if (abiFile.includes(".dbg.json")) {
                    //console.log("Skip: %s", abiFile);
                } else if (abiFile.endsWith(".json")) {
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
        } catch (e: any) {
            //abi left empty, proceed but just give the default template
            return JSON.parse("{ }");
        }
    }

    async start(abi: any, contractName: string) {

        const funcGenerationList: string[] = await this.pickElementsToGenerate(abi, contractName, TSType.CARD);
        const attrGenerationList: string[] = await this.pickElementsToGenerate(abi, contractName, TSType.ATTRIBUTE);

        //Ask if user wants to generate Info card
        const addInfoCard = await inquirer.prompt([{
            name: 'addInfo',
            message: `Generate an additional Info card?`,
            type: 'list',
            choices: ['yes', 'no']
        }]);

        const addInfo = addInfoCard.addInfo == 'yes';
        const infoCardAttrs = addInfo ? await this.selectAttrsForCard(attrGenerationList, "Info") : [];

        let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');
        this.xmlDoc = this.domParser.parseFromString(xmlFileContent, "application/xml");

        await this.setValuesFromABI(abi, contractName, contractName, funcGenerationList, attrGenerationList, infoCardAttrs, [], addInfo);
    }

    /**
     * Used for adding additional cards to an existing tokenscript; can handle external contracts
     *
     * @param abi ABI of contract we are pulling functions from
     * @param tokenAddress Pointer to contract (or existing contract)
     */
    async startUpdate(abi: any) {
        let funcGenerationList: string[] = await this.pickElementsToGenerate(abi, this.tokenAddress.name, TSType.CARD);
        let attrGenerationList: string[] = await this.pickElementsToGenerate(abi, this.tokenAddress.name, TSType.ATTRIBUTE);

        //we want to add these functions and attrs into the existing TS
        //import existing TS
        let xmlFileContent = fs.readFileSync(resolve(this.dir, Create.SRC_XML_FILE), 'utf-8');
        this.xmlDoc = this.domParser.parseFromString(xmlFileContent, "application/xml");

        //create cards and append to TS
        //1. load existing attrs
        let {contracts, cards, attributes, origin } = this.readTokenScriptDetails();

        //2. check if we need to add the new contract, and add if required
        let existingContract = this.findExistingContract(contracts, this.tokenAddress);

        if (existingContract.chainId == 0) {
            this.addContractToTokenScript(this.tokenAddress);
        } else {
            //ensure contract names match
            this.tokenAddress.name = existingContract.name;
        }

        //3. Detect name clash: don't overwrite existing cards or attrs
        funcGenerationList = this.removeListOverlap(funcGenerationList, cards, 'Card');
        attrGenerationList = this.removeListOverlap(attrGenerationList, attributes, 'Attribute');

        await this.setValuesFromABI(abi, this.tokenAddress.name, origin, funcGenerationList, attrGenerationList, [], attributes, false);
    }

    private addContractToTokenScript(tokenAddress: ContractLocator) {
        let contractCard: HTMLElement = this.getDocument().createElement("ts:contract");
        contractCard.setAttribute("interface", "erc721"); // TODO: May not be ERC721, but it doesn't matter here (TODO: confirm this assumption)
        contractCard.setAttribute("name", tokenAddress.name);

        let addressElement = this.getDocument().createElement("ts:address");
        addressElement.setAttribute("network", tokenAddress.chainId.toString());
        addressElement.appendChild(this.getDocument().createTextNode(tokenAddress.address));
        contractCard.appendChild(addressElement);

        //now add in after the contract
        this.xmlDoc!!.getElementsByTagName("ts:token")[0].insertBefore(contractCard, this.xmlDoc!!.getElementsByTagName("ts:origins")[0]);
    }

    private async selectAttrsForCard(attrGenerationList: string[], cardName: string): Promise<string[]> {
        const funcChoice = await inquirer.prompt([{
            name: 'attrSelection',
            message: `Add which Attributes in the ${cardName} card?`,
            type: 'checkbox',
            choices: attrGenerationList,
        }]);

        return funcChoice.attrSelection;
    }

    getABIFetchOption(templateDef: ITemplateFields[], values: any[]): boolean {
        const abiFetchIndex = templateDef.findIndex((element) => element.token === '__PULL_ABI');
        let val = values[abiFetchIndex];
        return val === 'yes';
    }

    private async pickElementsToGenerate(abi: any, contractName: string, type: any): Promise<string[]> {
        let selection: any[] = [];

        for (let func of abi) {
            switch (func.type) {
                case Types.FUNCTION:
                    let [attr, viewCard] = await this.handleFunction(func, contractName, contractName);
                    if ((viewCard !== "" && type == TSType.CARD) || (attr !== "" && type == TSType.ATTRIBUTE)) {
                        selection.push({ name: func.name, value: func.name });
                    }
                    break;
                case Types.EVENT:
                    break;
                case Types.TUPLE:
                    break;
            }
        }

        //now ask user to pick functions to add cards for cards
        const funcChoice = await inquirer.prompt([{
            name: 'funcSelection',
            message: `Generate TokenScript ${type.toString()} for which functions?`,
            type: 'checkbox',
            choices: selection,
        }]);

        return funcChoice.funcSelection;
    }

    private async getAttributeFunctions(abi: any, attrNames: string[], contractName: string): Promise<any[]> {
        let attrs: any[] = [];

        for (let func of abi) {
            if (func.type == Types.FUNCTION) {
                if (this.isOnGenerationList(func.name, attrNames)) {
                    let [attr,] = await this.handleFunction(func, contractName, contractName);
                    if (attr !== "") {
                        attrs.push(func);
                    }
                }
            }
        }

        let { attributeDetails } = this.readTokenScriptDetails();
        //now scan existing attributes and add corresponding functions
        for (let attribute of attributeDetails) {
            if (this.isOnGenerationList(attribute.name, attrNames)) {
                let funcGen = { name: attribute.name, outputs:[{type: attribute.outputType}], stateMutability: "view", type: "function" };
                attrs.push(funcGen);
            }
        }

        return attrs;
    }

    private async setValuesFromABI(abi: any, contractName: string, originName: string, funcGenerationList: string[], attrGenerationList: string[],
            infoCardAttrNames: string[], existingAttrs: string[], addInfo: boolean) {
        let attributesToAdd = [];
        let eventsToAdd: any[] = [];
        let viewCards = [];
        let selectableAttrs = attrGenerationList;
        for (let attr of existingAttrs) {
            selectableAttrs.push(attr);
        }

        for (let func of abi) {
            switch (func.type) {
                case Types.FUNCTION:
                    let [attr, viewCard] = await this.handleFunction(func, contractName, originName);
                    if (attr !== "" && this.isOnGenerationList(func.name, attrGenerationList)) {
                        attributesToAdd.push(attr);
                    } else if (viewCard !== "" && this.isOnGenerationList(func.name, funcGenerationList)) {
                        viewCards.push(viewCard);
                        const attrSelection = await this.selectAttrsForCard(selectableAttrs, func.name);
                        const attrsForCard = await this.getAttributeFunctions(abi, attrSelection, contractName);
                        await this.createCardFile(func, attrsForCard); // and create the card
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

        if (addInfo) {
            const infoCardAttrs = await this.getAttributeFunctions(abi, infoCardAttrNames, contractName);
            //User requested to add default info card
            let infoCard = await this.infoCard(contractName, infoCardAttrs);
            viewCards.push(infoCard);
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
    private postParse(xmlDoc: Node) {
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

    private async handleFunction(func: any, contractName: string, originName: string): Promise<[any, any]> {
        if (!DoNotGenerate.includes(func.name)) {
            switch (func.stateMutability) {
                case FunctionTypes.PURE:
                case FunctionTypes.VIEW:
                    let attribute = this.getAttribute(func, contractName);
                    return [attribute, ""];
                case FunctionTypes.NON_PAYABLE:
                case FunctionTypes.PAYABLE:
                    let viewCard = await this.parseFunctionToViewCard(func, contractName, originName);
                    return ["", viewCard];
            }
        }

        return ["", ""];
    }

    private appendToTS(attributes: any[], events: EventContractObject[], viewCards: any[]): Document {

        for (let viewCard of viewCards) {
            this.xmlDoc!!.getElementsByTagName("ts:cards")[0].appendChild(viewCard);
        }

        for (let attribute of attributes) {
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

    private getEvent(eventName: string, contractName: string, contractAddress: string, eventABI: any): EventObject {
        let eventObject: EventObject = {};
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
        if (contractObj?.address === this.tokenAddress.address) return;
        for (let contract of this.contractsFromEvents) {
            if (contract.address === contractObj?.address) {
                //contract already included
                return;
            }
        }
        if (contractObj != null) {
            this.contractsFromEvents.push(contractObj);
        }
    }

    private getEventParams(eventAbi: any) {
        let eventParams = [];
        for (let eventInput of eventAbi.inputs) {
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
    private async parseFunctionToViewCard(func: any, contractName: string, originName: string) {
        let [data, valid] = this.getData(func);
        if (!valid) { //can't handle this card transaction type yet (tuple or array type)
            return "";
        }

        let card = this.initCard(func.name, "action", originName, "primary");

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
        if (AS !== "") {
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

        return card;
    }

    private async createCardFile(func: any, attrList: any[]) {
        //now create the file
        //each card needs a view
        let fName = func.name + ".html";

        await this.fillCardDetails(fName, func, attrList);
    }

    private async infoCard(contractName: string, infoCardAttrs: any[]) {
        const infoName = "Info";
        let card: HTMLElement = this.initCard(infoName, "token", contractName, "secondary");

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
        includeAttr.value = "./" + infoName.toLocaleLowerCase() + ".html";
        viewInclude.attributes.setNamedItem(includeAttr);

        viewNode.appendChild(viewContent);
        viewNode.appendChild(viewInclude);

        card.appendChild(viewNode);

        await this.fillCardDetails("info.html", null, infoCardAttrs);

        return card;
    }

    private getModuleBlock(attrName: string, syntax: string) {
        const attrNameCap = this.capitaliseFirstChar(attrName);
        const valueStyle = syntax == 'address' ? "valueSmall" : "value";
        return `<div class="card"><div class="card-image">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fill-rule="evenodd">
                <circle fill="#597DF2" cx="12" cy="12" r="12"/>
                <path fill="#FFF" d="M12 21.6v-5.173L6 12.69z"/>
                <path fill="#BDCBFA" d="M12 16.427V21.6l6-8.91zM12 1.8v6.93l6 2.584z"/>
                <path fill="#FFF" d="m12 1.8-6 9.514 6-2.584z"/>
                <path fill="#BDCBFA" d="m6 11.314 6 3.356V8.73z"/>
                <path fill="#7B96F5" d="m12 14.67 6-3.356-6-2.584z"/>
            </g>
        </svg>
        </div>
        <div class="text">
            <p class="title">${attrNameCap}</p>
            <p class="${valueStyle}">\${value_${attrName}}</p>
        </div>
        </div>
        `;
    }

    private getJSBlock(attrName: string, syntax: string): string {
        let jSBlock = "";
        switch (syntax) {
            case "uint":
            case "int":
                //insert value code, assuming that
                jSBlock += `value_${attrName} = currentTokenInstance.${attrName}\n`;
                jSBlock += `//value = Math.floor(1.0 * (currentTokenInstance.${attrName} / 10 ** 18) * 10000) / 10000; // <-- use for decimals 18 return value\n`;
                break;
            case "bytes":
                //convert value to hex
                jSBlock += `value_${attrName} = currentTokenInstance.${attrName}\n`;
                break;
            case "string":
            case "address":
            default:
                jSBlock += `value_${attrName} = currentTokenInstance.${attrName}\n`;
                break;
        }

        return jSBlock;
    }

    private formatAttribute(typeName: string, name: string, originsElement: any) {
        let attributeTypeNode = this.getDocument().createElement("ts:attribute");
        attributeTypeNode.setAttribute("name", name);
        let type = this.getDocument().createElement("ts:type");
        let syntaxElement = this.getDocument().createElement("ts:syntax");
        let syntax = this.getOutputSyntax(typeName);
        if (syntax !== "") {
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
        if (syntax !== "") {
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
        if (AS !== "") {
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
        if (func.inputs.length !== 0) {
            for (let input of func.inputs) {
                if (!this.checkValidity(input.type)) {
                    valid = false; //currently array attributes aren't handled
                    break;
                }
                let paramNode = this.getDocument().createElement(`ts:${input.type}`); //<<-- createElement can't handle array elements - TODO: find why.
                let { refType, parsedName } = this.parseInputName(input);
                paramNode.setAttribute(refType, parsedName);
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
    private parseInputName(input: any): { refType: string, parsedName: string } {
        let parsedName = input.name.replace(/^_+/, '');
        let refType = "ref";
        if (AbbreviateTypes.includes(parsedName)) {
            return { refType, parsedName };
        } else if (input.name == "quantity" && input.type.includes("int")) { // There may be other types that can be changes to local-ref if they are input types
            refType = "local-ref";
        }

        parsedName = input.name;
        return { refType, parsedName };
    }

    private async processTemplateCard(templateDef: ITemplateData, value: string, file: any) {
        let values: any[] = [];
        values.push(value);
        let templateProcessor = new TemplateProcessor(templateDef, this.dir);
        await templateProcessor.replaceInFiles(values, [file]);
    }

    private initCard(funcName: string, cardType: string, contractName: string, buttonClass: string): HTMLElement {
        let card: HTMLElement = this.getDocument().createElement("ts:card");
        card.setAttribute("type", cardType);
        let nameAttr = this.getDocument().createAttribute("name");
        nameAttr.value = funcName;
        card.attributes.setNamedItem(nameAttr);
        if (buttonClass.length > 0) {
            let buttonClassAttr = this.getDocument().createAttribute("buttonClass");
            buttonClassAttr.value = buttonClass;
            card.attributes.setNamedItem(buttonClassAttr);
        }
        let originsAttr = this.getDocument().createAttribute("origins");
        originsAttr.value = contractName;
        card.attributes.setNamedItem(originsAttr);

        //label
        let nameNode = this.getDocument().createElement("ts:label");
        let stringNodeName = this.getDocument().createElement("ts:string");
        stringNodeName.setAttribute("xml:lang", "en");

        stringNodeName.appendChild(this.getDocument().createTextNode(this.capitaliseFirstChar(funcName)));
        nameNode.appendChild(stringNodeName);
        card.appendChild(nameNode);

        return card;
    }

    /**
     * Find all Attribute and Card names, and contracts in the TokenScript
     *
     * @returns array of contracts, card and attribute names
     */
    private readTokenScriptDetails(): { contracts: ContractLocator[], cards: string[], attributes: string[], origin: string, attributeDetails: ScannedFunction[] } {

        let tokenElements = this.xmlDoc!!.getElementsByTagName("ts:token");
        let cards: string[] = [];
        let contracts: ContractLocator[] = [];
        let attributes: string[] = [];
        let origin: string = "";
        let attributeDetails: ScannedFunction[] = [];

        for (let tokenElement of tokenElements) {

            let child = tokenElement.firstChild;
            while (child) {
                let element: HTMLElement = <HTMLElement>child;
                switch (child.nodeName) {
                    case "ts:attribute":
                        let name: string = element.getAttribute("name")!;
                        let detail: ScannedFunction = this.parseAttribute(name, child);
                        attributes.push(name);
                        attributeDetails.push(detail);
                        break;
                    case "ts:cards":
                        cards = this.parseCardNames(child);
                        break;
                    case "ts:contract":
                        contracts.push(this.parseContract(child));
                        break;
                    case "ts:origins":
                        origin = this.parseOrigin(child);
                        break;
                    default:
                        break;
                }

                child = child.nextSibling;
            }
        }

        return {
            contracts,
            cards,
            attributes,
            origin,
            attributeDetails
        };
    }

    private removeListOverlap(nameInputList: string[], existingList: string[], type: string): string[] {
        let inputList: string[] = [];
        for (let name of nameInputList) {
            if (existingList.includes(name)) {
                CliUx.ux.info(`Will not generate ${type} '${name}': Remove from TokenScript if you require it to be regenerated.`);
            } else {
                inputList.push(name);
            }
        }

        return inputList;
    }


    private parseCardNames(node: Node): string[] {
        let cards: string[] = [];
        let child = node.firstChild;
        while (child) {
            let nextChild = child.nextSibling;
            let element: HTMLElement = <HTMLElement>child;
            if (child.nodeName == 'ts:card') {
                //pull card name
                let name = element.getAttribute("name")!;
                cards.push(name);
            }

            child = nextChild;
        }

        return cards;
    }

    private parseAttribute(funcName: string, node: Node): ScannedFunction {
        let child = node.firstChild;
        let inSyntax: boolean = false;
        let syntax: string = ""

        while (child) {
            let nextChild = child.nextSibling;
            if (child.nodeName == 'ts:type') {
                nextChild = child.firstChild;
            } else if (child.nodeName == 'ts:syntax') {
                inSyntax = true;
                nextChild = child.firstChild;
            } else if (inSyntax && child.nodeType == 3) {
                syntax = child.textContent!;
                break;
            }

            child = nextChild;
        }

        return {name: funcName, outputType: this.lookupSyntax(syntax)};
    }

    private parseContract(node: Node): ContractLocator {

        let child = node.firstChild;
        let element: HTMLElement = <HTMLElement>node;
        let contractName: string = element.getAttribute("name")!;
        let contractAddress: string = "";
        let network: number = 0;

        while (child) {
            let nextChild = child.nextSibling;
            if (child.nodeName == 'ts:address') {
                element = <HTMLElement>child;
                network = Number(element.getAttribute("network")!);
                nextChild = child.firstChild;
            } else if (child.nodeType == 3) {
                contractAddress = child.textContent!;
                if (contractAddress.length == 42) {
                    break;
                }
            }

            child = nextChild;
        }

        if (contractAddress.length != 42 || network == 0) {
            throw new Error(`Malformed ts:contract element, name="${contractName}".`);
        }

        return { chainId: network, address: contractAddress, name: contractName };
    }

    private parseOrigin(node: Node): string {
        let child = node.firstChild;
        let origin: string = "";

        while (child) {
            let nextChild = child.nextSibling;
            if (child.nodeName == 'ts:ethereum') {
                let element = <HTMLElement>child;
                if (element.hasAttribute("contract")) {
                    origin = element.getAttribute("contract")!;
                    break;
                } else {
                    throw new Error(`Malformed ts:origins section`);
                }
            }

            child = nextChild;
        }

        return origin;
    }

    private async fillCardDetails(fName: string, func: any, attrList: any[]) {
        let added: boolean = false;

        let varBlock = "";
        let infoBlock = "";
        let jSBlock = "";

        fs.copyFileSync("card-prototype.html", fName);

        for (let attr of attrList) { //populate an info card with an attribute for illustration
            // create attribute source based on first attribute
            let syntax = this.getFirstOutputType(attr.outputs);
            infoBlock += this.getModuleBlock(attr.name, syntax);
            varBlock += `var value_${attr.name};\n`;
            jSBlock += this.getJSBlock(attr.name, syntax);
            added = true;
        }

        if (!added) {
            //take a generic attribute like token Symbol
            infoBlock = this.getModuleBlock("symbol", "string");
            jSBlock = `value = currentTokenInstance.symbol\n`;
            varBlock = `var value;\n`;
        }

        if (func) {
            const cardName = this.capitaliseFirstChar(func.name);
            infoBlock += `<br/><h3>${cardName}</h3><br/><p>Call ${func.name} function<br/>`;
            if (func.stateMutability == FunctionTypes.PAYABLE) {
                infoBlock += `<div class="input-container">
                <input type="number" id="valAmount">
                <label for="valAmount">Value Amount</label>
                </div>`;
            }
            infoBlock += this.formInputBox(func);
        }

        //do a parse on the new file. Can the card display attributes?
        let templateDef = Templates.getScriptTemplate("VAR_BLOCK");
        await this.processTemplateCard(templateDef, varBlock, fName);
        templateDef = Templates.getScriptTemplate("HTML_BLOCK");
        await this.processTemplateCard(templateDef, infoBlock, fName);
        templateDef = Templates.getScriptTemplate("JS_BLOCK");
        await this.processTemplateCard(templateDef, jSBlock, fName);
    }



    //
    //
    // Helper methods
    //
    //

    private capitaliseFirstChar(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private findExistingContract(contracts: ContractLocator[], tokenAddress: ContractLocator): ContractLocator {
        for (let contract of contracts) {
            if (contract.address == tokenAddress.address && contract.chainId == tokenAddress.chainId) {
                //no need to add, but match up names to ensure added attributes/functions point to correct token
                return contract;
            }
        }

        return {chainId: 0, address: "", name: ""};
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
        if (outputs.length == 0) {
            return "";
        } else {
            let ethType = outputs[0].type;
            if (ethType.includes("uint")) {
                return "uint";
            } else if (ethType.includes("byte")) {
                return "bytes";
            } else if (ethType.includes("string")) {
                return "utf8";
            } else if (ethType.includes("address")) {
                return "address";
            } else {
                return "";
            }
        }
    }

    private getFirstOutputType(outputs: any[]): string {
        if (outputs.length == 0) {
            return "";
        } else if (outputs[0].type.includes("uint")) {
            return "uint";
        } else if (outputs[0].type.includes("int")) {
            return "int";
        } else if (outputs[0].type.includes("string")) {
            return "string";
        } else if (outputs[0].type.includes("byte")) {
            return "byte";
        } else if (outputs[0].type.includes("address")) {
            return "address";
        } else {
            return outputs[0].type;
        }
    }

    private getSyntax(outputs: any[]) {
        const firstOutput = this.getFirstOutputType(outputs);
        if (outputs.length == 0) {
            return "";
        } else if (firstOutput.includes("uint") || firstOutput.includes("int")) {
            return "1.3.6.1.4.1.1466.115.121.1.36";
        } else if (firstOutput.includes("string")) {
            return "1.3.6.1.4.1.1466.115.121.1.26";
        } else if (firstOutput.includes("byte")) {
            return "1.3.6.1.4.1.1466.115.121.1.6";
        } else {
            return "1.3.6.1.4.1.1466.115.121.1.15";
        }
    }

    private lookupSyntax(syntax: string) {
        switch (syntax) {
            case "1.3.6.1.4.1.1466.115.121.1.36":
                return "uint";
            case "1.3.6.1.4.1.1466.115.121.1.26":
                return "string";
            case "1.3.6.1.4.1.1466.115.121.1.6":
                return "byte";
            case "1.3.6.1.4.1.1466.115.121.1.15":
                return "string";
            default:
                return "string";
        }
    }

    private getOutputSyntax(outputType: any) {
        if (outputType.includes("uint") || outputType.includes("int")) {
            return "1.3.6.1.4.1.1466.115.121.1.36";
        } else if (outputType.includes("string")) {
            return "1.3.6.1.4.1.1466.115.121.1.26";
        } else if (outputType.includes("byte")) {
            return "1.3.6.1.4.1.1466.115.121.1.6";
        } else {
            return "1.3.6.1.4.1.1466.115.121.1.15";
        }
    }

    private formInputBox(func: any): string {
        let inputBox = "";
        if (func.inputs.length !== 0) {
            for (let input of func.inputs) {
                let { parsedName } = this.parseInputName(input);
                if (input.type.includes('int') && parsedName.includes('quantity')) {
                    //add input box
                    const visibleString = this.capitaliseFirstChar(parsedName);
                    inputBox = `<div class="input-container"><input type="number" id="${parsedName}"><label for="${parsedName}">${visibleString}</label></div>`;
                    break;
                }
            }
        }

        return inputBox;
    }

    private isOnGenerationList(funcName: string, generationList: string[]): boolean {
        return generationList.includes(funcName);
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
            const apiResult: { status: string, message: string, result: string } = response.data;

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
            const apiResult: { status: string, message: string, result: string } = response.data;
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
        return new Promise(resolve => setTimeout(resolve, ms));
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
