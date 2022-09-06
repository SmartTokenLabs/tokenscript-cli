
export interface ITemplateFields {
	name: string;
	token: string;
	prompt: string;
	value: string;
}

export interface ITemplateData {
	name: string;
	description: string;
	templateFields: ITemplateFields[];
}

export class TemplateProcessor {

	constructor(private template: ITemplateData, private values: []) {

	}

	processTemplateTokens(){


	}
}
