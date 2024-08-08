import {resolve} from "path";
import fs from "fs";

export function getProjectFile(workspaceUrl: string){
	const configPath = resolve(workspaceUrl, "tokenscript-project.json");

	if (!fs.existsSync(configPath))
		return {
			$schema: "https://tokenscript.org/schemas/project/tokenscript-project.schema.json",
			environment: { default: {} }
		};

	return JSON.parse(fs.readFileSync(configPath, "utf8"))
}

export function getEnvironment(workspaceUrl: string, envName: string = "default"){

	const projectConfig = getProjectFile(workspaceUrl);

	let env = {...projectConfig.environment.default};

	if (envName && envName !== "default"){
		if (!projectConfig.environment[envName])
			throw new Error(`Environment config with the name ${envName} not found, update your tokenscript-project.json`)
		env = {...env, ...projectConfig.environment[envName]};
	}

	return env;
}
