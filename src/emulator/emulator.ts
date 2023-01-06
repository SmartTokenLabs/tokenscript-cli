import express, {Express, Request, Response} from "express";
import chokidar from "chokidar";
import exec, {ChildProcess} from "child_process";
import open from "open";
import expressWs from "express-ws";
import fs from "fs";
import cors from "cors";

export class Emulator {

	server?: Express;

	ws?: expressWs.Instance;

	projectDir: string = process.cwd();

	buildProcess?: ChildProcess;

	buildTimer?: NodeJS.Timeout;

	constructor(private emulatorHost?: string|undefined) {
	}

	startEmulator() {

		this.launchServer();

		this.watchProject();
	}

	launchServer() {

		this.server = express();

		const port = process.env.PORT ?? 8090;

		const tsHost = "http://localhost:" + port + "/";
		let isRemoteEmulator = false;

		if (this.emulatorHost) {
			this.server.use(cors());
			isRemoteEmulator = true;
		} else {
			this.emulatorHost = tsHost;
		}

		// Uncomment to use local built version of the tokenscript viewer
		//this.server.use(express.static(__dirname + "/../../node_modules/@tokenscript/browser-runtime/dist/"));

		const viewerBundlePath = fs.existsSync(__dirname + "/../../static/viewerBundle/") ?
									__dirname + "/../../static/viewerBundle/" :
									__dirname + "/viewerBundle";
		this.server.use(express.static(viewerBundlePath));

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

		const urlToOpen = isRemoteEmulator ? "=" + encodeURIComponent(tsHost) : "";

		if (!fs.existsSync(this.projectDir + "/out/tokenscript.tsml")){
			this.buildProject(() => {
				open(this.emulatorHost + "#emulator=" + urlToOpen);
			})
		} else {
			open(this.emulatorHost + "#emulator" + urlToOpen);
		}

	}

	watchProject(){

		chokidar.watch([
			this.projectDir + "/src",
			this.projectDir + "/tokenscript.xml"
		], {
			ignoreInitial: true
		}).on('all', (event, path) => {

			if (this.buildTimer)
				clearTimeout(this.buildTimer);

			this.buildTimer = setTimeout(() => {
				this.buildProject();
			}, 1000);
		});

	}

	buildProject(callback?: Function){

		if (this.buildProcess){
			this.buildProcess.kill("SIGINT");
			this.buildProcess = undefined;
		}

		console.log("Build started..");

		this.buildProcess = exec.exec("cd " + this.projectDir + " && npm run build", (error, stdout, stderr) => {

			this.sendClientNotification();
			console.log("Build updated!");

			if (callback) callback();
		});

		this.buildProcess.stdout?.pipe(process.stdout);
	}

	sendClientNotification(){
		this.ws?.getWss().clients.forEach(function (client: any) {
			client.send("BUILD_UPDATED");
		});
	}

}

