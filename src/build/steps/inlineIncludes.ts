import {BuildProcessor, IBuildStep} from "../buildProcessor";
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

		for (let i = 0, len = elems.length; i < len; i++){

			const elem = elems[0];

			let type = elem.getAttribute("type");
			let src = elem.getAttribute("src");

			if (!type || !src){
				throw new Error("Invalid include tag, type and src attributes must be defined!");
			}

			this.context.cli.log("Processing " + src);

			let content = this.getIncludeContent(type, src);

			let parent = elem.parentElement;

			if (!parent)
				throw new Error("DOM Error, could not find parent element!");

			parent.removeChild(elem);

			// TODO: Replace at same position rather than append.
			if (type === "html") {
				const contentElem = this.context.parseXml(content, "text/html");

				let scriptElems = contentElem.getElementsByTagName("script");

				for (let s = 0; s < scriptElems.length; s++) {

					scriptElems[s].innerHTML = "//<![CDATA[\r\n" + scriptElems[s].innerHTML + "\r\n//]]>";
				}

				parent.append(...contentElem.body.childNodes);

				let styleElems = contentElem.getElementsByTagName("style");

				for (let s = 0; s < styleElems.length; s++) {

					styleElems[s].innerHTML = "/* <![CDATA[ */ \r\n" + styleElems[s].innerHTML + "\r\n /* //]]> */";
				}

				parent.append(...contentElem.body.childNodes);
			} else {
				parent.innerHTML += content;
			}
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
				content = `<style>
					/* <![CDATA[ */
					${content}
					/* ]]> */
				</style>`;
				break;

			case "js":
				content = `<script type="text/javascript">
					// <![CDATA[
					${content}
					// ]]>
				</script>`;
				break;

			default:
				throw new Error("Include type " + type + " does not exist!");
		}

		return content;
	}
}
