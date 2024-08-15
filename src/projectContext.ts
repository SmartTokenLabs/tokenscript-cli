import {Command} from "@oclif/core";
import fs from "fs";
import {join, resolve} from "path";
import {XMLSerializer} from "@xmldom/xmldom";
import {JSDOM} from "jsdom";
import {BuildProcessor} from "./build/buildProcessor";

interface ProjectSettings {
	environment: Record<string, Record<string, any>>;
	contracts: Record<string, {hardhatAbiPath?: string, abi?: any[]}>;
}

export abstract class ProjectContext {

	static SRC_XML_FILE = "tokenscript.xml";
	static PROJECT_FILE = "tokenscript-project.json";

	private xmlString: string|null = null;
	private xmlDoc: Document|null = null;

	private projectSettings?: ProjectSettings;

	constructor(
		public workspace: string
	) {

	}

	getProjectSettings(){
		return ProjectContext.getProjectFile(this.workspace);
	}

	getEnvironment(envName: string = "default"){

		const projectConfig = ProjectContext.getProjectFile(this.workspace);

		let env = {...projectConfig.environment.default};

		if (envName && envName !== "default"){
			if (!projectConfig.environment[envName])
				throw new Error(`Environment config with the name ${envName} not found, update your tokenscript-project.json`)
			env = {...env, ...projectConfig.environment[envName]};
		}

		return env;
	}

	setProjectSettings(projectSettings: ProjectSettings){
		this.projectSettings = projectSettings;
	}

	saveProjectSettings(){
		fs.writeFileSync(join(this.workspace, ProjectContext.PROJECT_FILE), JSON.stringify(this.projectSettings, null, "\t"));
	}

	static getProjectFile(workspaceUrl: string): ProjectSettings {
		const configPath = resolve(workspaceUrl, ProjectContext.PROJECT_FILE);

		if (!fs.existsSync(configPath))
			return <ProjectSettings>{
				$schema: "https://tokenscript.org/schemas/project/tokenscript-project.schema.json",
				contracts: {},
				environment: { default: {} }
			};

		return JSON.parse(fs.readFileSync(configPath, "utf8")) as ProjectSettings
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

	public getOutputXmlPath(): string {
		throw new Error("Output not enabled");
	};

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
