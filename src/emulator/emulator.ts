import express, {Express, Request, Response} from "express";
import chokidar from "chokidar";
import exec from "child_process";

import expressWs from "express-ws";

export class Emulator {

	server?: Express;

	ws?: expressWs.Instance;

	projectDir: string = process.cwd();

	startEmulator() {

		this.launchServer();

		this.watchProject();
	}

	launchServer() {

		this.server = express();

		const port = process.env.PORT ?? 8090;

		this.server.use(express.static("../../tokenscript-playground/browser-runtime/dist/"));

		this.server.use(express.static(this.projectDir + "/out/"));

		this.ws = expressWs(this.server);

		this.ws.app.ws('/ws', function(ws: any, req) {
			ws.on('message', function(msg: any) {
				console.log(msg);
				ws.send("Great reply!");
			});
		});

		this.server.listen(port, () => {
			console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
		});

	}

	watchProject(){

		chokidar.watch([
			this.projectDir + "/src",
			this.projectDir + "/tokenscript.xml"
		], {
			ignoreInitial: true
		}).on('all', (event, path) => {

			console.log("Build started..");

			const buildProc = exec.exec("cd " + this.projectDir + " && npm run build", (error, stdout, stderr) => {

				this.sendClientNotification();
				console.log("Build updated!");
			});
;
			buildProc.on('data', function(data) {
				console.log(data.toString());
			});

		});

	}

	buildProject(){


	}

	sendClientNotification(){
		this.ws?.getWss().clients.forEach(function (client: any) {
			client.send("BUILD_UPDATED");
		});
	}

}

