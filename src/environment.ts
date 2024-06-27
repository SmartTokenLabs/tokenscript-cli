import {resolve} from "path";
import fs from "fs";

export function getEnvironment(workspaceUrl: string, envName: string = "default"){

	const configPath = resolve(workspaceUrl, "tokenscript-project.json");

	if (!fs.existsSync(configPath))
		return {};

	const projectConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

	let env = {...projectConfig.environment.default};

	if (envName && envName !== "default"){
		if (!projectConfig.environment[envName])
			throw new Error(`Environment config with the name ${envName} not found, update your tokenscript-project.json`)
		env = {...env, ...projectConfig.environment[envName]};
	}

	return env;
}
