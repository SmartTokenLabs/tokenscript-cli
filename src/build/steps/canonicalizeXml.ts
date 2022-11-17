import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {XmlDsigC14NTransform} from "xmldsigjs";

export class CanonicalizeXml implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	async runBuildStep() {

		this.context.updateStatus("Canonicalization of XML...");

		const c14n = new XmlDsigC14NTransform();

		c14n.LoadInnerXml(this.context.getXmlDoc());
		const canonical = c14n.GetOutput();

		this.context.setXmlString(canonical);
	}
}
