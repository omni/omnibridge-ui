import { BigNumber } from 'ethers';
import { ETH_XDAI_BRIDGE } from 'lib/networks';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const ETHER_CURRENCY_LOGO =
  'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880';
export const BNB_CURRENCY_LOGO =
  'https://assets.coingecko.com/coins/images/825/small/binance-coin-logo.png?1547034615';

export const LARGEST_UINT256 = BigNumber.from(
  '115792089237316195423570985008687907853269984665640564039457584007913129639935',
);

export const POLLING_INTERVAL =
  process.env.REACT_APP_UI_STATUS_UPDATE_INTERVAL || 5000;

export const DEFAULT_BRIDGE_DIRECTION =
  process.env.REACT_APP_DEFAULT_BRIDGE_DIRECTION || ETH_XDAI_BRIDGE;

export const NON_ETH_CHAIN_IDS = [56, 77, 100];

export const XDAI_CHAIN_IDS = [77, 100];

export const nativeCurrencies = {
  1: {
    chainId: 1,
    decimals: 18,
    logoURI: ETHER_CURRENCY_LOGO,
    address: ADDRESS_ZERO,
    name: 'Ether',
    symbol: 'ETH',
    mode: 'NATIVE',
    homeTokenAddress:
      '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'.toLowerCase(),
  },
  42: {
    chainId: 42,
    decimals: 18,
    logoURI: ETHER_CURRENCY_LOGO,
    address: ADDRESS_ZERO,
    name: 'Kovan Ether',
    symbol: 'KETH',
    mode: 'NATIVE',
    homeTokenAddress:
      '0x3D14493DF2B479E6BABE82Fc2373F91622bac025'.toLowerCase(),
  },
  56: {
    chainId: 56,
    decimals: 18,
    logoURI: BNB_CURRENCY_LOGO,
    name: 'Binance Coin',
    address: ADDRESS_ZERO,
    symbol: 'BNB',
    mode: 'NATIVE',
    homeTokenAddress:
      '0xCa8d20f3e0144a72C6B5d576e9Bd3Fd8557E2B04'.toLowerCase(),
  },
};

export const nativeCurrencyMediators = {
  1: '',
  42: '0x227a6f13aa0dba8912d740c0f88fb1304b2597e1'.toLowerCase(),
  56: '0xefc33f8b2c4d51005585962be7ea20518ea9fd0d'.toLowerCase(),
};

export const networkNames = {
  1: 'ETH Mainnet',
  42: 'Kovan Testnet',
  56: 'Binance Smart Chain',
  77: 'Sokol Testnet',
  100: 'xDai Chain',
};

export const networkLabels = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Görli',
  42: 'Kovan',
  56: 'BSC',
  77: 'Sokol',
  100: 'xDai',
};

export const networkCurrencies = {
  1: {
    name: 'Ethereum',
    symbol: 'ETH',
  },
  42: {
    name: 'Ethereum',
    symbol: 'ETH',
  },
  56: {
    name: 'Binance Coin',
    symbol: 'BNB',
  },
  77: {
    name: 'Sokol POA',
    symbol: 'SPOA',
  },
  100: {
    name: 'xDai',
    symbol: 'xDai',
  },
};

const {
  REACT_APP_MAINNET_RPC_URL,
  REACT_APP_XDAI_RPC_URL,
  REACT_APP_SOKOL_RPC_URL,
  REACT_APP_KOVAN_RPC_URL,
  REACT_APP_BSC_RPC_URL,
} = process.env;

export const chainUrls = {
  1: {
    rpc: REACT_APP_MAINNET_RPC_URL.split(' '),
    explorer: 'https://blockscout.com/eth/mainnet',
    chainId: 1,
    name: networkNames[1],
  },
  42: {
    rpc: REACT_APP_KOVAN_RPC_URL.split(' '),
    explorer: 'https://blockscout.com/eth/kovan',
    chainId: 42,
    name: networkNames[42],
  },
  56: {
    rpc: REACT_APP_BSC_RPC_URL.split(' '),
    explorer: 'https://bscscan.com',
    chainId: 56,
    name: networkNames[56],
  },
  77: {
    rpc: REACT_APP_SOKOL_RPC_URL.split(' '),
    explorer: 'https://blockscout.com/poa/sokol',
    chainId: 77,
    name: networkNames[77],
  },
  100: {
    rpc: REACT_APP_XDAI_RPC_URL.split(' '),
    explorer: 'https://blockscout.com/xdai/mainnet',
    chainId: 100,
    name: networkNames[100],
  },
};

export const defaultTokensUrl = {
  100: 'https://tokens.honeyswap.org',
  1: 'https://tokens.uniswap.org',
  42: '',
  77: '',
  56: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/tokenlist.json',
};

export const GRAPH_HEALTH_ENDPOINT =
  'https://api.thegraph.com/index-node/graphql';

export const LOCAL_STORAGE_KEYS = {
  DONT_SHOW_CLAIMS: 'dont-show-claims',
  MAINNET_RPC_URL: 'mainnet-rpc-url',
  XDAI_RPC_URL: 'xdai-rpc-url',
  BSC_RPC_URL: 'bsc-rpc-url',
  KOVAN_RPC_URL: 'kovan-rpc-url',
  SOKOL_RPC_URL: 'sokol-rpc-url',
  NEVER_SHOW_CLAIMS: 'never-show-claims',
  INFINITE_UNLOCK: 'infinite-unlock',
  CUSTOM_TOKENS: 'customTokens',
  DISABLE_BALANCE_WHILE_TOKEN_FETCH: 'disable-balance-while-token-fetch',
  BRIDGE_DIRECTION: 'bridge-direction',
};
