import fs from "fs";
import {XMLSerializer} from "@xmldom/xmldom";
import {PrepareOutputDirectory} from "./steps/prepareOutputDirectory";
import {CanonicalizeXml} from "./steps/canonicalizeXml";
import {ValidateXml} from "./steps/validateXml";
import {InlineIncludes} from "./steps/inlineIncludes";
import {Command} from "@oclif/core";
import {JSDOM} from "jsdom";
import {resolve} from "path";
import {ApplyEnvironment} from "./steps/applyEnvironment";
import {BuildWeb} from "./steps/buildWeb";

export interface IBuildStep {
	runBuildStep(): void
}

export class BuildProcessor {

	static BUILD_STEPS = [
		PrepareOutputDirectory,
		BuildWeb,
		CanonicalizeXml,
		InlineIncludes,
		ApplyEnvironment,
		ValidateXml
	];

	static OUTPUT_DIR = "out";
	static SRC_XML_FILE = "tokenscript.xml";

	private xmlString?: string|null = null;
	private xmlDoc: Document|null = null;

	constructor(
		public workspace: string,
		public cli: Command,
		public args: {[key: string]: any},
		private statusCallback: (status: string) => void
	) {

	}

	updateStatus(status: string){
		this.statusCallback(status);
	}

	async build(){

		this.cli.log(`\r\nBuilding TokenScript with ${this.args.environment} environment`);

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
			this.xmlString = fs.readFileSync(resolve(this.workspace, BuildProcessor.SRC_XML_FILE), 'utf-8');
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

		this.saveXmlOutput();
	}

	public getOutputXmlPath(){
		return resolve(this.workspace, BuildProcessor.OUTPUT_DIR, "tokenscript.tsml");
	}

	private saveXmlOutput(){
		fs.writeFileSync(this.getOutputXmlPath(), this.xmlString!!);
	}

	public parseXml(xmlString: string, type: DOMParserSupportedType = "text/xml"){

		const dom = new JSDOM("");
		const DOMParser = dom.window.DOMParser;
		const parser = new DOMParser;

		return parser.parseFromString(xmlString, type);
	}

}
