import {BuildProcessor, IBuildStep} from "../buildProcessor";
const xsd = require("@tokenscript/libxmljs2-xsd") as any;
import {join, sep} from "path";

export class ValidateXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Validate TSML...");

		let doc = this.context.getXmlDoc();

		let ns = doc.documentElement.getAttribute("xmlns:ts");

		if (!ns)
			throw new Error("Could not find namespace in XML. Are you missing a namespace declaration? Are there invalid characters in your tokenscript.xml?");

		const versionMatch = ns!!.match(/([0-9]{4})\/([0-9]{2})/g);

		if (!versionMatch)
			throw new Error("Invalid schema version specified");

		const schemaVersion = versionMatch[0].replace("/", "-");

		// For some reason external schemas referenced by tokenscript.xsd do not work when using path.join or path.resolve
		const schemaBasePath = __dirname + sep + ".." + sep + ".." + sep + "schema" + sep + schemaVersion + sep;

		const schema = xsd.parseFile(join(schemaBasePath, "tokenscript.xsd"), {
			baseUrl: schemaBasePath
		});

		const errors = schema.validateFile(this.context.getOutputXmlPath());

		if (errors) {

			const errMsg = "XML Validation Errors: \r\n" +
				errors.map((error: any) => {
					return "- " + error.message.trim() + " (line " + error.line + ", column " + error.column + ")";
				}).join("\r\n");

			throw new Error(errMsg);
		}

	}
}
