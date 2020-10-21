import { BigNumber } from 'ethers';

import {
  ambs,
  chainUrls,
  defaultTokens,
  defaultTokensUrl,
  graphEndpoints,
  mediators,
  networkNames,
} from './constants';
import { getOverriddenMediator, isOverridden } from './overrides';

export const getBridgeNetwork = chainId => {
  switch (chainId) {
    case 1:
      return 100;
    case 42:
      return 77;
    case 77:
      return 42;
    case 100:
    default:
      return 1;
  }
};

export const isxDaiChain = chainId => {
  switch (chainId) {
    case 1:
      return false;
    case 42:
      return false;
    case 77:
      return true;
    case 100:
    default:
      return true;
  }
};

export const getDefaultToken = chainId => {
  switch (chainId) {
    case 1:
      return defaultTokens[1];
    case 42:
      return defaultTokens[42];
    case 77:
      return defaultTokens[77];
    case 100:
    default:
      return defaultTokens[100];
  }
};

export const getMediatorAddress = (tokenAddress, chainId) => {
  if (isOverridden(tokenAddress)) {
    return getOverriddenMediator(tokenAddress, chainId);
  }
  switch (chainId) {
    case 1:
      return mediators[1];
    case 42:
      return mediators[42];
    case 77:
      return mediators[77];
    case 100:
    default:
      return mediators[100];
  }
};

export const getNetworkName = chainId => {
  switch (chainId) {
    case 1:
      return networkNames[1];
    case 42:
      return networkNames[42];
    case 77:
      return networkNames[77];
    case 100:
    default:
      return networkNames[100];
  }
};

export const getAMBAddress = chainId => {
  switch (chainId) {
    case 1:
      return ambs[1];
    case 42:
      return ambs[42];
    case 77:
      return ambs[77];
    case 100:
    default:
      return ambs[100];
  }
};

export const getGraphEndpoint = chainId => {
  switch (chainId) {
    case 1:
      return graphEndpoints[1];
    case 42:
      return graphEndpoints[42];
    case 77:
      return graphEndpoints[77];
    case 100:
    default:
      return graphEndpoints[100];
  }
};

export const getRPCUrl = chainId => {
  switch (chainId) {
    case 1:
      return chainUrls[1].rpc;
    case 42:
      return chainUrls[42].rpc;
    case 77:
      return chainUrls[77].rpc;
    case 100:
    default:
      return chainUrls[100].rpc;
  }
};

export const getExplorerUrl = chainId => {
  switch (chainId) {
    case 1:
      return chainUrls[1].explorer;
    case 42:
      return chainUrls[42].explorer;
    case 77:
      return chainUrls[77].explorer;
    case 100:
    default:
      return chainUrls[100].explorer;
  }
};

export const getMonitorUrl = (chainId, hash) => {
  const url = 'https://alm-xdai.herokuapp.com/';
  const testUrl = 'https://alm-test-amb.herokuapp.com/';
  switch (chainId) {
    case 1:
      return `${url}1/${hash}`;
    case 42:
      return `${testUrl}42/${hash}`;
    case 77:
      return `${testUrl}77/${hash}`;
    case 100:
    default:
      return `${url}100/${hash}`;
  }
};

export const uniqueTokens = list => {
  const seen = {};
  return list.filter(function isDuplicate(token) {
    const { address } = token;
    const lowerCaseAddress = address.toLowerCase();
    const isDuplicateItem = Object.prototype.hasOwnProperty.call(
      seen,
      lowerCaseAddress,
    )
      ? false
      : (seen[lowerCaseAddress] = true);
    return isDuplicateItem;
  });
};

export const getTokenListUrl = chainId => {
  switch (chainId) {
    case 1:
      return defaultTokensUrl[1];
    case 42:
      return defaultTokensUrl[42];
    case 77:
      return defaultTokensUrl[77];
    default:
    case 100:
      return defaultTokensUrl[100];
  }
};

export const formatValue = (num, dec) => {
  const number = window.BigInt(num);
  const round = window.BigInt(10 ** Number(dec));
  const value = Number((number * window.BigInt(1000)) / round) / 1000;
  return value.toFixed(3);
};

const countDecimals = value => {
  if (Math.floor(value) === value) return 0;
  return value.toString().split('.')[1].length || 0;
};

export const parseValue = (num, dec) => {
  if (!num) {
    return window.BigInt(0);
  }
  const number = Number(num);
  const numberDec = countDecimals(number);
  const round = window.BigInt(10 ** Number(dec));
  const value =
    (window.BigInt(Math.floor(number * 10 ** numberDec)) * round) /
    window.BigInt(10 ** numberDec);
  return value;
};

// ETH/ERC20 Default Limits
export const defaultMinPerTx = (isxDai, decimals) => {
  let minPerTx = BigNumber.from(10).pow(isxDai ? decimals : decimals - 3);
  if (minPerTx.lt(1)) {
    minPerTx = BigNumber.from(1);
  }
  return minPerTx;
};
export const defaultMaxPerTx = decimals => BigNumber.from(10).pow(decimals + 9);
export const defaultDailyLimit = decimals =>
  BigNumber.from(10).pow(decimals + 18);

export const uriToHttp = (uri) => {
  const protocol = uri.split(':')[0].toLowerCase()
  switch (protocol) {
    case 'https':
      return [uri]
    case 'http':
      return ['https' + uri.substr(4), uri]
    case 'ipfs':
      const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2]
      return [`https://cloudflare-ipfs.com/ipfs/${hash}/`, `https://ipfs.io/ipfs/${hash}/`]
    case 'ipns':
      const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2]
      return [`https://cloudflare-ipfs.com/ipns/${name}/`, `https://ipfs.io/ipns/${name}/`]
    default:
      return []
  }
}
