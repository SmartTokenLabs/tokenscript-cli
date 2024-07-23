import express, {Express} from "express";
import chokidar from "chokidar";
import exec, {ChildProcess} from "child_process";
import open from "open";
import expressWs from "express-ws";
import fs, {existsSync} from "fs";
import cors from "cors";
import {join} from "path";
import {useTokenscriptBuildCommand} from "../utils";

export class Emulator {

	static PROD_VIEWER_LOC = join(__dirname, "..", "viewerBundle");
	static DEV_VIEWER_LOC = join(__dirname, "..", "..", "static", "viewerBundle");

	server?: Express;

	ws?: expressWs.Instance;

	projectDir: string = process.cwd();

	buildProcess?: ChildProcess;

	buildTimer?: NodeJS.Timeout;

	buildCommand: string;

	constructor(private emulatorHost?: string|undefined, private args: {[key: string]: any} = {}) {
		process.env.TOKENSCRIPT_ENV = this.args.environment;
		this.buildCommand = useTokenscriptBuildCommand(this.projectDir) ? "tokenscript build" : "npm run build";
	}

	startEmulator() {

		if (!existsSync(join(this.projectDir, "tokenscript.xml"))){
			throw new Error("TokenScript XML file not detected, are you running this command from a TokenScript project directory?");
		}

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

		const viewerBundlePath = fs.existsSync(Emulator.DEV_VIEWER_LOC) ?
									Emulator.DEV_VIEWER_LOC : Emulator.PROD_VIEWER_LOC;
		this.server.use(express.static(viewerBundlePath));

		this.server.use(express.static(join(this.projectDir, "out")));

		this.ws = expressWs(this.server);

		this.ws.app.ws('/ws', function(ws: any, req) {
			ws.on('message', function(msg: any) {
				console.log(msg);
			});
		});

		this.server.listen(port, () => {
			console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
		});

		const urlToOpen = isRemoteEmulator ? "=" + encodeURIComponent(tsHost) : "";

		// TODO: Store hashes of previous src build & compare.
		//if (!fs.existsSync(join(this.projectDir, "out", "tokenscript.tsml"))){
			this.buildProject(() => {
				open(this.emulatorHost + "?emulator" + urlToOpen + "#card=0");
			})
		/*} else {
			open(this.emulatorHost + "?emulator" + urlToOpen + "#card=0");
		}*/

	}

	watchProject(){

		// For package.json projects we are only interested in monitoring src and tokenscript.xml.
		// But for legacy projects we monitor the entire directory, ignoring some folders
		const watchedPaths = [];

		if (existsSync(join(this.projectDir, "src"))){
			watchedPaths.push(join(this.projectDir, "src"));
			watchedPaths.push(join(this.projectDir, "tokenscript.xml"))
		} else {
			watchedPaths.push(this.projectDir);
		}

		chokidar.watch(watchedPaths, {
			ignoreInitial: true,
			ignored: [
				join(this.projectDir, "out"),
				join(this.projectDir, "node_modules"),
			]
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

		this.buildProcess = exec.exec("cd " + this.projectDir + " && " + this.buildCommand, (error, stdout, stderr) => {

			if (error){
				const errMsg = "Failed to build TokenScript project: ";
				if (callback){
					throw new Error(errMsg + error.message);
				} else {
					console.error(errMsg, error.message);
				}
			}

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

