import {BuildProcessor, IBuildStep} from "../buildProcessor";
import * as fs from "fs";
import {resolve} from "path";

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

			const isUiStyle = elem.parentElement?.tagName === "ts:style"

			let content = this.getIncludeContent(type, src, !isUiStyle);

			let parent = elem.parentElement;

			if (!parent)
				throw new Error("DOM Error, could not find parent element!");

			parent.removeChild(elem);

			// TODO: Replace at same position rather than append.
			if (type === "html") {
				const contentElem = this.context.parseXml(content, "text/html");

				let scriptElems = contentElem.getElementsByTagName("script");

				for (let s = 0; s < scriptElems.length; s++) {

					scriptElems[s].innerHTML = "//<![CDATA[\r\n" + this.escapeNonPrintableUnicodeChars(scriptElems[s].innerHTML) + "\r\n//]]>";
				}

				let styleElems = contentElem.getElementsByTagName("style");

				for (let s = 0; s < styleElems.length; s++) {
					// React
					styleElems[s].removeAttribute("crossorigin");
					styleElems[s].removeAttribute("rel");

					styleElems[s].innerHTML = "/*<![CDATA[*/ \r\n" + styleElems[s].innerHTML + "\r\n /*//]]>*/";
				}

				parent.append(...contentElem.head.childNodes);
				parent.append(...contentElem.body.childNodes);
			} else if (isUiStyle) {
				parent.innerHTML += content;
			} else {
				// TODO: This seems to cause issues with XML signing
				//try {
					//parent.innerHTML += content;
				//} catch (e){
					//console.warn(e);
					const contentElem = this.context.parseXml(content, "text/xml");
					parent.append(contentElem.documentElement);
				//}
			}
		}

		this.context.setXmlDoc(doc);
	}

	private escapeNonPrintableUnicodeChars(content: string){

		content = content.replace(/\u0019/g, "\\u0019");

		return content;
	}

	private getIncludeContent(type: string, src: string, addTags: boolean){

		src = resolve(this.context.workspace, src);

		if (!fs.existsSync(src))
			throw new Error("Include tag src " + src + " does not exist or cannot be read!");

		let content = fs.readFileSync(src, 'utf-8');

		switch (type){
			case "html":
				break;

			case "css":
				content = `${addTags ? `<style>
					/* <![CDATA[ */` : ""}
					${content}
					${addTags ? `/* ]]> */
				</style>` : ""}`;
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
