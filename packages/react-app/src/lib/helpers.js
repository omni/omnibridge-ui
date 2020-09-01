import { mediators } from '@project/contracts';

import { defaultTokens } from './constants';

export const getBridgeNetwork = (chainId) => {
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

export const isxDaiChain = (chainId) => {
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

export const getDefaultToken = (chainId) => {
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

export const getMediatorAddress = (chainId) => {
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
