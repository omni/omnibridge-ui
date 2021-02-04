import { BigNumber } from 'ethers';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

export const LARGEST_UINT256 = BigNumber.from(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

export const POLLING_INTERVAL =
  process.env.REACT_APP_UI_STATUS_UPDATE_INTERVAL || 1000;

export const HOME_NETWORK =
  process.env.REACT_APP_HOME_NETWORK === 'xdai' ? 100 : 77;

export const INFURA_ID = process.env.REACT_APP_INFURA_ID;

export const networkNames = {
  1: 'ETH Mainnet',
  42: 'Kovan Testnet',
  77: 'Sokol Testnet',
  100: 'xDai Chain',
};

export const networkLabels = {
  1: 'Mainnet',
  42: 'Kovan',
  77: 'Sokol',
  100: 'xDai',
};

export const chainUrls = {
  100: {
    rpc: process.env.REACT_APP_HOME_RPC_URL || 'https://xdai.poanetwork.dev',
    explorer:
      process.env.REACT_APP_HOME_EXPLORER_PREFIX ||
      'https://blockscout.com/poa/xdai',
    monitor:
      process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX ||
      'https://alm-xdai.herokuapp.com',
    chainId: 100,
    name: networkNames[100],
  },
  1: {
    rpc:
      process.env.REACT_APP_FOREIGN_RPC_URL ||
      `https://mainnet.infura.io/v3/${INFURA_ID}`,
    explorer:
      process.env.REACT_APP_FOREIGN_EXPLORER_PREFIX ||
      'https://blockscout.com/eth/mainnet',
    monitor:
      process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX ||
      'https://alm-xdai.herokuapp.com',
    chainId: 1,
    name: networkNames[1],
  },
  77: {
    rpc: process.env.REACT_APP_HOME_RPC_URL || 'https://sokol.poa.network',
    explorer:
      process.env.REACT_APP_HOME_EXPLORER_PREFIX ||
      'https://blockscout.com/poa/sokol',
    monitor:
      process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX ||
      'https://alm-test-amb.herokuapp.com',
    chainId: 77,
    name: networkNames[77],
  },
  42: {
    rpc:
      process.env.REACT_APP_FOREIGN_RPC_URL ||
      `https://kovan.infura.io/v3/${INFURA_ID}`,
    explorer:
      process.env.REACT_APP_FOREIGN_EXPLORER_PREFIX ||
      'https://blockscout.com/eth/kovan',
    monitor:
      process.env.REACT_APP_AMB_LIVE_MONITOR_PREFIX ||
      'https://alm-test-amb.herokuapp.com',
    chainId: 42,
    name: networkNames[42],
  },
};

export const defaultTokens = {
  100: {
    address: '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
    chainId: 100,
    symbol: 'STAKE',
  },
  1: {
    address: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    chainId: 1,
    symbol: 'STAKE',
  },
  77: {
    address: '0x408ec1bb883da0ea0fb3c955ea6befcd05aa7c3a',
    chainId: 77,
    symbol: 'STAKE',
  },
  42: {
    address: '0xFD2df5dCe4c89B007A43CF88d8161dAf1A17C7AB',
    chainId: 42,
    symbol: 'STAKE',
  },
};

export const graphEndpoints = {
  100: 'https://api.thegraph.com/subgraphs/name/raid-guild/xdai-omnibridge',
  1: 'https://api.thegraph.com/subgraphs/name/raid-guild/mainnet-omnibridge',
  77: 'https://api.thegraph.com/subgraphs/name/dan13ram/sokol-omnibridge',
  42: 'https://api.thegraph.com/subgraphs/name/dan13ram/kovan-omnibridge',
};

export const mediators = {
  42:
    process.env.REACT_APP_FOREIGN_MEDIATOR_ADDRESS ||
    '0xA960d095470f7509955d5402e36d9DB984B5C8E2',
  77:
    process.env.REACT_APP_HOME_MEDIATOR_ADDRESS ||
    '0x40CdfF886715A4012fAD0219D15C98bB149AeF0e',
  1:
    process.env.REACT_APP_FOREIGN_MEDIATOR_ADDRESS ||
    '0x88ad09518695c6c3712AC10a214bE5109a655671',
  100:
    process.env.REACT_APP_HOME_MEDIATOR_ADDRESS ||
    '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d',
};

export const ambs = {
  42:
    process.env.REACT_APP_HOME_AMB_ADDRESS ||
    '0xFe446bEF1DbF7AFE24E81e05BC8B271C1BA9a560',
  77:
    process.env.REACT_APP_FOREIGN_AMB_ADDRESS ||
    '0xFe446bEF1DbF7AFE24E81e05BC8B271C1BA9a560',
  1:
    process.env.REACT_APP_HOME_AMB_ADDRESS ||
    '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e',
  100:
    process.env.REACT_APP_FOREIGN_AMB_ADDRESS ||
    '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59',
};

export const REVERSE_BRIDGE_ENABLED =
  process.env.REACT_APP_ENABLE_REVERSED_BRIDGE === 'true';

export const defaultTokensUrl = {
  100: 'https://tokens.honeyswap.org',
  1: 'https://tokens.uniswap.org',
  42: '',
  77: '',
};
