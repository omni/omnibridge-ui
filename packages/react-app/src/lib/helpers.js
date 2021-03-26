import { BigNumber, utils } from 'ethers';
import {
  chainUrls,
  defaultTokens,
  defaultTokensUrl,
  LOCAL_STORAGE_KEYS,
  networkCurrencies,
  networkLabels,
  networkNames,
} from 'lib/constants';
import {
  BSC_XDAI_BRIDGE,
  ETH_XDAI_BRIDGE,
  KOVAN_SOKOL_BRIDGE,
  networks,
} from 'lib/networks';

import { getOverriddenMediator, isOverridden } from './overrides';

export const getDefaultToken = chainId =>
  defaultTokens[chainId] || defaultTokens[1];

export const getWalletProviderName = provider =>
  provider?.connection?.url || null;

export const getNetworkName = chainId =>
  networkNames[chainId] || 'Unknown Network';

export const getNetworkLabel = chainId => networkLabels[chainId] || 'Unknown';

export const getNetworkCurrency = chainId =>
  networkCurrencies[chainId] || { name: 'Unknown', symbol: 'Unknown' };

export const getRPCUrl = chainId => (chainUrls[chainId] || chainUrls[1]).rpc;

export const getExplorerUrl = chainId =>
  (chainUrls[chainId] || chainUrls[1]).explorer;

export const getTokenListUrl = chainId =>
  defaultTokensUrl[chainId] || defaultTokensUrl[1];

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
  const str = utils.formatUnits(num, dec);
  if (str.length > 50) {
    const expStr = Number(str)
      .toExponential()
      .replace(/e\+?/, ' x 10^');
    const split = expStr.split(' x 10^');
    const first = Number(split[0]).toLocaleString('en', {
      maximumFractionDigits: 4,
    });
    return `${first} x 10^${split[1]}`;
  }
  return Number(str).toLocaleString('en', { maximumFractionDigits: 4 });
};

export const parseValue = (num, dec) => {
  if (!num || isNaN(Number(num))) {
    return BigNumber.from(0);
  }
  return utils.parseUnits(num, dec);
};

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

export const fetchQueryParams = search => {
  if (!search.trim().length) return null;
  return search
    .replace('?', '')
    .split(/&/g)
    .reduce((acc, keyValuePair) => {
      const [key, value] = keyValuePair.split('=');
      acc[key] = value;
      return acc;
    }, {});
};

export const getAccountString = account => {
  const len = account.length;
  return `${account.substr(0, 6)}...${account.substr(
    len - 4,
    len - 1,
  )}`.toUpperCase();
};

export const logError = error => {
  // eslint-disable-next-line no-console
  console.error(error);
};

export const logDebug = error => {
  if (process.env.REACT_APP_DEBUG_LOGS === 'true') {
    // eslint-disable-next-line no-console
    console.debug(error);
  }
};

const {
  XDAI_RPC_URL,
  MAINNET_RPC_URL,
  BSC_RPC_URL,
  KOVAN_RPC_URL,
  SOKOL_RPC_URL,
} = LOCAL_STORAGE_KEYS;

export const getRPCKeys = bridgeDirection => {
  switch (bridgeDirection) {
    case ETH_XDAI_BRIDGE:
      return {
        homeRPCKey: XDAI_RPC_URL,
        foreignRPCKey: MAINNET_RPC_URL,
      };
    case BSC_XDAI_BRIDGE:
      return {
        homeRPCKey: XDAI_RPC_URL,
        foreignRPCKey: BSC_RPC_URL,
      };
    case KOVAN_SOKOL_BRIDGE:
    default:
      return {
        homeRPCKey: SOKOL_RPC_URL,
        foreignRPCKey: KOVAN_RPC_URL,
      };
  }
};

export const getMediatorAddressWithoutOverride = (bridgeDirection, chainId) => {
  if (!bridgeDirection || !chainId) return null;
  const { homeChainId, homeMediatorAddress, foreignMediatorAddress } = networks[
    bridgeDirection
  ];
  return homeChainId === chainId
    ? homeMediatorAddress.toLowerCase()
    : foreignMediatorAddress.toLowerCase();
};

export const getMediatorAddress = (bridgeDirection, token) => {
  if (!token || !token.chainId || !token.address) return null;
  if (isOverridden(bridgeDirection, token)) {
    return getOverriddenMediator(bridgeDirection, token);
  }
  return getMediatorAddressWithoutOverride(bridgeDirection, token.chainId);
};
