import { BigNumber } from 'ethers';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const LARGEST_UINT256 = BigNumber.from(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

export const POLLING_INTERVAL =
  process.env.REACT_APP_UI_STATUS_UPDATE_INTERVAL || 1000;

export const HOME_CHAIN_ID = Number(process.env.REACT_APP_HOME_CHAIN_ID) || 77;
export const FOREIGN_CHAIN_ID =
  Number(process.env.REACT_APP_FOREIGN_CHAIN_ID) || 42;

export const networkNames = {
  1: 'ETH Mainnet',
  42: 'Kovan Testnet',
  56: 'Binance Smart Chain',
  77: 'Sokol Testnet',
  100: 'xDai Chain',
};

export const networkLabels = {
  1: 'Mainnet',
  42: 'Kovan',
  56: 'Binance Smart Chain',
  77: 'Sokol',
  100: 'xDai',
};

export const chainUrls = {
  [HOME_CHAIN_ID]: {
    rpc: process.env.REACT_APP_HOME_RPC_URL,
    explorer: process.env.REACT_APP_HOME_EXPLORER_PREFIX,
    monitor: process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX,
    chainId: HOME_CHAIN_ID,
    name: networkNames[HOME_CHAIN_ID],
  },
  [FOREIGN_CHAIN_ID]: {
    rpc: process.env.REACT_APP_FOREIGN_RPC_URL,
    explorer: process.env.REACT_APP_FOREIGN_EXPLORER_PREFIX,
    monitor: process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX,
    chainId: FOREIGN_CHAIN_ID,
    name: networkNames[FOREIGN_CHAIN_ID],
  },
};

export const defaultTokens = {
  100: {
    address: '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
    chainId: 100,
    symbol: 'STAKE',
    name: 'STAKE on xDai',
  },
  1: {
    address: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    chainId: 1,
    symbol: 'STAKE',
    name: 'STAKE',
  },
  77: {
    address: '0x408ec1bb883da0ea0fb3c955ea6befcd05aa7c3a',
    chainId: 77,
    symbol: 'STAKE',
    name: 'STAKE on xDai',
  },
  42: {
    address: '0xFD2df5dCe4c89B007A43CF88d8161dAf1A17C7AB',
    chainId: 42,
    symbol: 'STAKE',
    name: 'STAKE',
  },
  56: {
    address: '0x24e5CF4a0577563d4e7761D14D53C8D0b504E337',
    chainId: 56,
    symbol: 'STAKE',
    name: 'STAKE on xDai on BSC',
  },
};

export const subgraphNames = {
  [HOME_CHAIN_ID]: process.env.REACT_APP_HOME_GRAPH_NAME,
  [FOREIGN_CHAIN_ID]: process.env.REACT_APP_FOREIGN_GRAPH_NAME,
};

export const graphEndpoints = {
  [HOME_CHAIN_ID]: `https://api.thegraph.com/subgraphs/name/${subgraphNames[HOME_CHAIN_ID]}`,
  [FOREIGN_CHAIN_ID]: `https://api.thegraph.com/subgraphs/name/${subgraphNames[FOREIGN_CHAIN_ID]}`,
};

export const mediators = {
  [HOME_CHAIN_ID]: process.env.REACT_APP_HOME_MEDIATOR_ADDRESS,
  [FOREIGN_CHAIN_ID]: process.env.REACT_APP_FOREIGN_MEDIATOR_ADDRESS,
};

export const ambs = {
  [HOME_CHAIN_ID]: process.env.REACT_APP_HOME_AMB_ADDRESS,
  [FOREIGN_CHAIN_ID]: process.env.REACT_APP_FOREIGN_AMB_ADDRESS,
};

export const REVERSE_BRIDGE_ENABLED =
  process.env.REACT_APP_ENABLE_REVERSED_BRIDGE === 'true';

export const defaultTokensUrl = {
  100: 'https://tokens.honeyswap.org',
  1: 'https://tokens.uniswap.org',
  42: '',
  77: '',
  56: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/tokenlist.json',
};

export const GRAPH_HEALTH_ENDPOINT =
  'https://api.thegraph.com/index-node/graphql';
