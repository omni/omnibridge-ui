import ethers from 'ethers';

import { getRPCUrl } from './helpers';

const ethersProviders = {};

export const getEthersProvider = chainId => {
  if (ethersProviders[chainId]) {
    return ethersProviders[chainId];
  }
  const ethersProvider = new ethers.providers.JsonRpcProvider(
    getRPCUrl(chainId),
  );
  ethersProviders[chainId] = ethersProvider;
  return ethersProvider;
};
