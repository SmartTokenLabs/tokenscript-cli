import {BuildProcessor, IBuildStep} from "../buildProcessor";
const xsd = require("libxmljs2-xsd") as any;

export class ValidateXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Validate TSML...");

		let doc = this.context.getXmlDoc();

		let ns = doc.documentElement.getAttribute("xmlns:ts");

		if (!ns)
			throw new Error("Could not find namespace in XML. Are you missing a namespace declaration?");

		const schemaVersion = ns!!.indexOf("2022/09") > -1 ? "2022-09" : "2020-06";
		const schemaBasePath = __dirname + "/../../schema/" + schemaVersion + "/";

		const schema = xsd.parseFile(schemaBasePath + "tokenscript.xsd", {
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
