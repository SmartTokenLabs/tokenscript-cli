import {BuildProcessor, IBuildStep} from "../buildProcessor";
import {DOMParser} from "@xmldom/xmldom";
import * as fs from "fs";

export class InlineIncludes implements IBuildStep {

	constructor(private context: BuildProcessor) {
	}

	runBuildStep(): void {

		this.context.updateStatus("Inlining includes");

		const doc = this.context.getXmlDoc();

		if (doc == null)
			throw new Error("Cannot read xml document.");

		let elems = doc?.documentElement.getElementsByTagName("ts:include");

		for (let i = 0; i < elems.length; i++){
			let type = elems[i].getAttribute("type");
			let src = elems[i].getAttribute("src");

			if (!type || !src){
				throw new Error("Invalid include tag, type and src attributes must be defined!");
			}

			let content = this.getIncludeContent(type, src);

			let parent = elems[i].parentNode;

			if (!parent)
				throw new Error("DOM Error, could not find parent element!");

			// TODO: Replace at same position rather than append.
			parent.appendChild(new DOMParser().parseFromString(content, "text/html"));
			parent.removeChild(elems[i]);
		}

		this.context.setXmlDoc(doc);
	}

	private getIncludeContent(type: string, src: string){

		if (src.indexOf("/") !== 0){}
			src = this.context.workspace + "/" + src;

		if (!fs.existsSync(src))
			throw new Error("Include tag src " + src + " does not exist or cannot be read!");

		let content = fs.readFileSync(src, 'utf-8');

		switch (type){
			case "html":
				break;

			case "css":
				content = '<style>' + content + '</style>';
				break;

			case "js":
				content = '<script type="text/javascript">' + content + '</script>';
				break;

			default:
				throw new Error("Include type " + type + " does not exist!");
		}

		return content;
	}
}
