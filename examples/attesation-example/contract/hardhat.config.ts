import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.19",
  defaultNetwork: 'hardhat',
  networks: {
	hardhat: {
	  chainId: 11155111,
	}
  }
};

export default config;
