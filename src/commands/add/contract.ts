import {CliUx, Command, Flags} from "@oclif/core";
import inquirer from "inquirer";

export default class Contract extends Command {

	static description = 'Add an ethereum contract to the TokenScript'

	static flags = {
		//refreshAbi: Flags.boolean({char: 'r', description: 'If the ABI is on etherscan, this will fetch the most up to date version before proceeding', default: false}),
		chain: Flags.integer({char: 'n', description: "EVM Chain ID"}),
		contract: Flags.string({char: 'c', description: "Contract Address" }),
		pullAbi: Flags.enum({char: 'a', options: ['hardhat', 'etherscan']}),
		tokenType: Flags.enum({char: 't', options: ['erc20', 'erc721', 'erc1155']})
	}

	//static args = []

	async catch(error: Error|any) {

		CliUx.ux.action.stop("error");

		this.error(error.message);

		this.exit(error.code);
	}

	async run(): Promise<void> {

		let {args, flags} = await this.parse(Contract);

		if (
			!flags.chain ||
			!flags.contract
		){
			const res = await inquirer.prompt([
				{
					name: 'chain',
					message: 'Enter EVM chain ID as an integer',
					type: 'number'
				},
				{
					name: 'input',
					message: 'Enter EVM contract address for the token',
					type: 'input'
				},
				{
					name: 'tokenType',
					message: 'Enter the token standard for the contract',
					type: 'list',
					choices: [
						{
							name: "ERC-20 Fungible Token",
							value: "erc20"
						},
						{
							name: "ERC-721 Non-fungible Token",
							value: "erc721"
						},
						{
							name: "ERC-1155 Semi-fungible Token",
							value: "erc1155"
						},
					],
				},
				{
					name: 'pullAbi',
					message: 'How do you want to include the contract ABI?',
					type: 'list',
					choices: [
						{
							name: "Include it manually later",
							value: null
						},
						{
							name: "Specify Hardhat ABI location",
							value: "hardhat"
						},
						{
							name: "Pull from etherscan (or other block explorer)",
							value: "hardhat"
						},
					],
				},
			]);

			flags = {...flags, ...res};
		}

		if (flags.pullAbi){
			await inquirer.prompt([
				{
					name: 'hardhatAbiLocation',
					message: 'Enter the relative path to the hardhat ABI output',
					type: 'input'
				},
			]);
		}

		CliUx.ux.action.stop();

		console.log("\r\nSuccess!");
	}

	private addContract(){


	}
}
