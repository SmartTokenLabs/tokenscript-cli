type ChainConfig = {
  name: string;
  rpc: string;
  explorer: string;
};

type ChainId = number;

type ChainConfigMap = {
  [key in ChainId]: ChainConfig;
};

export const chainConfig: ChainConfigMap = {
  1: {
    name: 'ETHEREUM',
    rpc: 'https://nodes.mewapi.io/rpc/eth',
    explorer: 'https://etherscan.com/tx/',
  },
  5: {
    name: 'GOERLI',
    rpc: '',
    explorer: 'https://goerli.etherscan.io/tx/',
  },
  11155111: {
    name: 'SEPOLIA',
    rpc: '',
    explorer: 'https://sepolia.etherscan.io/tx/',
  },
  137: {
    name: 'POLYGON',
    rpc: 'https://polygon-rpc.com/',
    explorer: 'https://polygonscan.com/tx/',
  },
  80001: {
    name: 'MUMBAI',
    rpc: '',
    explorer: 'https://mumbai.polygonscan.com/tx/',
  },
  56: {
    name: 'BSC',
    rpc: 'https://bsc-dataseed.binance.org/',
    explorer: 'https://bscscan.com/tx/',
  },
  97: {
    name: 'BSC_TESTNET',
    rpc: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorer: 'https://testnet.bscscan.com/tx/',
  },
  43114: {
    name: 'AVALANCH',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    explorer: 'https://cchain.explorer.avax.network/tx/',
  },
  250: {
    name: 'FANTOM',
    rpc: 'https://rpc.fantom.network/',
    explorer: 'https://ftmscan.com/tx/',
  },
  42161: {
    name: 'ARBITRUM',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io/tx/',
  },
  10: {
    name: 'OPTIMISM',
    rpc: 'https://mainnet.optimism.io',
    explorer: 'https://optimistic.etherscan.io/tx/',
  },
  8217: {
    name: 'KLAYTN',
    rpc: 'https://public-node-api.klaytnapi.com/v1/cypress',
    explorer: 'https://scope.klaytn.com/tx/',
  },
  1001: {
    name: 'BAOBAB',
    rpc: 'https://public-node-api.klaytnapi.com/v1/baobab',
    explorer: 'https://baobab.scope.klaytn.com/tx/',
  }
};