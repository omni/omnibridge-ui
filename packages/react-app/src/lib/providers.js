import ethers from 'ethers';

import { chainUrls } from './constants';

const ethersProviders = {};

export const getEthersProvider = (chainId) => {
  if (ethersProviders[chainId]) {
    return ethersProviders[chainId];
  }
  const ethersProvider = new ethers.providers.JsonRpcProvider(
    chainUrls[chainId].rpc,
  );
  ethersProviders[chainId] = ethersProvider;
  return ethersProvider;
};
