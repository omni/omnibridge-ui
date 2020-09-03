import {
  chainUrls,
  defaultTokens,
  graphEndpoints,
  mediators,
} from './constants';

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

export const getMediatorAddress = chainId => {
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
