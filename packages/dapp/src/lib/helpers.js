import { BigNumber, utils } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import {
  chainUrls,
  defaultTokensUrl,
  LOCAL_STORAGE_KEYS,
  nativeCurrencies,
  nativeCurrencyMediators,
  networkCurrencies,
  networkLabels,
  networkNames,
} from 'lib/constants';
import {
  BSC_XDAI_BRIDGE,
  defaultTokens,
  ETH_BSC_BRIDGE,
  ETH_XDAI_BRIDGE,
  KOVAN_SOKOL_BRIDGE,
  networks,
} from 'lib/networks';

import { getOverriddenMediator, isOverridden } from './overrides';

export const getWalletProviderName = provider =>
  provider?.connection?.url || null;

export const getNativeCurrency = chainId => nativeCurrencies[chainId || 1];

export const getNetworkName = chainId =>
  networkNames[chainId] || 'Unknown Network';

export const getNetworkLabel = chainId => networkLabels[chainId] || 'Unknown';

export const getNetworkCurrency = chainId =>
  networkCurrencies[chainId] || { name: 'Unknown', symbol: 'Unknown' };

export const getRPCUrl = (chainId, returnAsArray = false) =>
  returnAsArray ? chainUrls[chainId || 1].rpc : chainUrls[chainId || 1].rpc[0];

export const getExplorerUrl = chainId =>
  (chainUrls[chainId] || chainUrls[1]).explorer;

export const getTokenListUrl = chainId =>
  defaultTokensUrl[chainId] || defaultTokensUrl[1];

export const removeElement = (array, index) => {
  const cloneArr = [...array];
  cloneArr.splice(index, 1);
  return cloneArr;
};

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
    const expStr = Number(str).toExponential().replace(/e\+?/, ' x 10^');
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
  if (!search || !search.trim().length) return null;
  return search
    .replace('?', '')
    .split(/&/g)
    .reduce((acc, keyValuePair) => {
      const [key, value] = keyValuePair.split('=');
      acc[key] = value;
      return acc;
    }, {});
};

export const getAccountString = address => {
  const account = getAddress(address);
  const len = account.length;
  return `0x${account.substr(2, 4)}...${account.substr(len - 4, len - 1)}`;
};

export const logError = (...args) => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

export const logDebug = (...args) => {
  if (process.env.REACT_APP_DEBUG_LOGS === 'true') {
    // eslint-disable-next-line no-console
    console.log(...args);
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
    case ETH_BSC_BRIDGE:
      return {
        homeRPCKey: BSC_RPC_URL,
        foreignRPCKey: MAINNET_RPC_URL,
      };
    case KOVAN_SOKOL_BRIDGE:
    default:
      return {
        homeRPCKey: SOKOL_RPC_URL,
        foreignRPCKey: KOVAN_RPC_URL,
      };
  }
};

export const getHelperContract = chainId =>
  nativeCurrencyMediators[chainId || 1];

export const getMediatorAddressWithoutOverride = (bridgeDirection, chainId) => {
  if (!bridgeDirection || !chainId) return null;
  const { homeChainId, homeMediatorAddress, foreignMediatorAddress } =
    networks[bridgeDirection];
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

export const truncateText = (text, maxLength) => {
  let truncated = text;

  if (truncated.length > maxLength - 3) {
    truncated = `${truncated.substr(0, maxLength - 3)}...`;
  }
  return truncated;
};

export const getDefaultToken = (bridgeDirection, chainId) => {
  const label = getNetworkLabel(chainId).toUpperCase();
  const storageKey = `${bridgeDirection.toUpperCase()}-${label}-FROM-TOKEN`;
  const tokenString = localStorage.getItem(storageKey);
  const token = JSON.parse(tokenString);
  if (token && token.chainId === chainId) return token;
  return defaultTokens[bridgeDirection][chainId];
};

const IMPOSSIBLE_ERROR =
  'Unable to perform the operation. Reload the application and try again.';

const TRANSACTION_REPLACED_ERROR =
  'Transaction was replaced by another. Reload the application and find the transaction in the history page.';

export const handleWalletError = (error, showError) => {
  if (error?.message && error?.message.length <= 120) {
    showError(error.message);
  } else if (
    error?.message &&
    error?.message.toLowerCase().includes('transaction was replaced')
  ) {
    showError(TRANSACTION_REPLACED_ERROR);
  } else {
    showError(IMPOSSIBLE_ERROR);
  }
};
