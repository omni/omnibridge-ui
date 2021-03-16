import { BigNumber, utils } from 'ethers';
import {
  ambs,
  chainUrls,
  defaultTokens,
  defaultTokensUrl,
  FOREIGN_CHAIN_ID,
  graphEndpoints,
  HOME_CHAIN_ID,
  mediators,
  networkCurrencies,
  networkLabels,
  networkNames,
  subgraphNames,
} from 'lib/constants';
import { getOverriddenMediator, isOverridden } from 'lib/overrides';

export const getBridgeNetwork = chainId => {
  return chainId === HOME_CHAIN_ID ? FOREIGN_CHAIN_ID : HOME_CHAIN_ID;
};

export const isxDaiChain = chainId => {
  return chainId === HOME_CHAIN_ID;
};

export const getDefaultToken = chainId =>
  defaultTokens[chainId] || defaultTokens[HOME_CHAIN_ID];

export const getMediatorAddressWithOverride = (tokenAddress, chainId) => {
  if (isOverridden(tokenAddress, chainId)) {
    return getOverriddenMediator(tokenAddress, chainId);
  }
  return getMediatorAddress(chainId);
};

export const getMediatorAddress = chainId =>
  mediators[chainId].toLowerCase() || mediators[HOME_CHAIN_ID].toLowerCase();

export const getWalletProviderName = provider =>
  provider?.connection?.url || null;
export const getNetworkName = chainId => networkNames[chainId] || 'Unknown';
export const getNetworkLabel = chainId => networkLabels[chainId] || 'Unknown';
export const getNetworkCurrency = chainId =>
  networkCurrencies[chainId] || { name: 'Unknown', symbol: 'Unknown' };
export const getAMBAddress = chainId => ambs[chainId] || ambs[HOME_CHAIN_ID];
export const getGraphEndpoint = chainId =>
  graphEndpoints[chainId] || graphEndpoints[HOME_CHAIN_ID];
export const getSubgraphName = chainId =>
  subgraphNames[chainId] || subgraphNames[HOME_CHAIN_ID];
export const getRPCUrl = chainId =>
  (chainUrls[chainId] || chainUrls[HOME_CHAIN_ID]).rpc;
export const getExplorerUrl = chainId =>
  (chainUrls[chainId] || chainUrls[HOME_CHAIN_ID]).explorer;
export const getTokenListUrl = chainId =>
  defaultTokensUrl[chainId] || defaultTokensUrl[HOME_CHAIN_ID];
export const getMonitorUrl = (chainId, hash) =>
  `${
    (chainUrls[chainId] || chainUrls[HOME_CHAIN_ID]).monitor
  }/${chainId}/${hash}`;

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
