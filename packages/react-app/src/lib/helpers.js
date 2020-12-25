import { BigNumber, utils } from 'ethers';

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

export const getDefaultToken = chainId =>
  defaultTokens[chainId] || defaultTokens[100];

export const getMediatorAddressWithOverride = (tokenAddress, chainId) => {
  if (isOverridden(tokenAddress)) {
    return getOverriddenMediator(tokenAddress, chainId);
  }
  return getMediatorAddress(chainId);
};

export const getMediatorAddress = chainId =>
  mediators[chainId] || mediators[100];
export const getNetworkName = chainId => networkNames[chainId] || 'Unknown';
export const getAMBAddress = chainId => ambs[chainId] || ambs[100];
export const getGraphEndpoint = chainId =>
  graphEndpoints[chainId] || graphEndpoints[100];
export const getRPCUrl = chainId => (chainUrls[chainId] || chainUrls[100]).rpc;
export const getExplorerUrl = chainId =>
  (chainUrls[chainId] || chainUrls[100]).explorer;
export const getTokenListUrl = chainId =>
  defaultTokensUrl[chainId] || defaultTokensUrl[100];
export const getMonitorUrl = (chainId, hash) =>
  `${(chainUrls[chainId] || chainUrls[100]).monitor}/${chainId}/${hash}`;

export const uniqueTokens = list => {
  const seen = {};
  return list.filter(token => {
    const { address } = token;
    const lowerCaseAddress = address.toLowerCase();
    const isDuplicate = Object.prototype.hasOwnProperty.call(
      seen,
      lowerCaseAddress,
    )
      ? false
      : (seen[lowerCaseAddress] = true);
    return isDuplicate;
  });
};

export const formatValue = (num, dec) => {
  return utils.formatUnits(num, dec);
};

export const parseValue = (num, dec) => {
  if (!num || isNaN(Number(num))) {
    return BigNumber.from(0);
  }
  return utils.parseUnits(num, dec);
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

export const uriToHttp = uri => {
  const protocol = uri.split(':')[0].toLowerCase();
  const hash = uri.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
  const name = uri.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
  switch (protocol) {
    case 'https':
      return [uri];
    case 'http':
      return [`https${uri.substr(4)}`, uri];
    case 'ipfs':
      return [
        `https://cloudflare-ipfs.com/ipfs/${hash}/`,
        `https://ipfs.io/ipfs/${hash}/`,
      ];
    case 'ipns':
      return [
        `https://cloudflare-ipfs.com/ipns/${name}/`,
        `https://ipfs.io/ipns/${name}/`,
      ];
    default:
      return [];
  }
};

export const getAccountString = account => {
  const len = account.length;
  return `${account.substr(0, 6)}...${account.substr(len - 4, len - 1)}`;
};
