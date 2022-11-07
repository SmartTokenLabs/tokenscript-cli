import fs from "fs";
import {XMLSerializer} from "@xmldom/xmldom";
import {PrepareOutputDirectory} from "./steps/prepareOutputDirectory";
import {CanonicalizeXml} from "./steps/canonicalizeXml";
import {ValidateXml} from "./steps/validateXml";
import {InlineIncludes} from "./steps/inlineIncludes";
import {Command} from "@oclif/core";
import {JSDOM} from "jsdom";

export interface IBuildStep {
	runBuildStep(): void
}

export class BuildProcessor {

	static BUILD_STEPS = [
		PrepareOutputDirectory,
		CanonicalizeXml,
		InlineIncludes,
		ValidateXml
	];

	static OUTPUT_DIR = "/out";
	static SRC_XML_FILE = "/tokenscript.xml";

	private xmlString?: string|null = null;
	private xmlDoc: Document|null = null;

	constructor(
		public workspace: string,
		public cli: Command,
		private statusCallback: (status: string) => void
	) {

	}

	updateStatus(status: string){
		this.statusCallback(status);
	}

	async build(){

		for (let BuildStep of BuildProcessor.BUILD_STEPS){

			let buildStep = new BuildStep(this);

			await new Promise(resolve => setTimeout(resolve, 500));

			await buildStep.runBuildStep();

		}
	}

	async validate(){

		const index = BuildProcessor.BUILD_STEPS.indexOf(ValidateXml);

		const validator = new BuildProcessor.BUILD_STEPS[index](this);

		await validator.runBuildStep();

	}

	getXmlString(){
		if (!this.xmlString){
			this.xmlString = fs.readFileSync(this.workspace + BuildProcessor.SRC_XML_FILE, 'utf-8');
		}
		return this.xmlString;
	}

	getXmlDoc(){
		if (!this.xmlDoc){
			this.xmlDoc = this.parseXml(this.getXmlString());
		}
		return this.xmlDoc;
	}

	setXmlString(xml: string){
		this.xmlDoc = null;
		this.xmlString = xml;
		this.saveXmlOutput();
	}

	setXmlDoc(xmlDoc: Document){
		this.xmlDoc = xmlDoc;

		this.xmlString = new XMLSerializer().serializeToString(this.xmlDoc);

		//this.xmlString = serialize(this.xmlDoc, { requireWellFormed: false });

		//this.xmlString = this.xmlDoc.documentElement.outerHTML;

		this.saveXmlOutput();

		// TODO: Fix: For some reason validation fails in some cases unless the XML string is reloaded from the disk.
		this.xmlString = null;
	}

	private saveXmlOutput(){
		fs.writeFileSync(this.workspace + BuildProcessor.OUTPUT_DIR + "/tokenscript.tsml", this.xmlString!!);
	}

	public parseXml(xmlString: string, type: DOMParserSupportedType = "text/xml"){

		const dom = new JSDOM("");
		const DOMParser = dom.window.DOMParser;
		const parser = new DOMParser;

		return parser.parseFromString(xmlString, type);

		//this.xmlDoc = new DOMParser().parseFromString(this.getXmlString(), 'text/xml');
	}

}
