import ethers from 'ethers';

import { getEthersProvider } from './providers';

export const fetchImplementation = async (proxyAddress, chainId) => {
  const ethersProvider = await getEthersProvider(chainId);
  const abi = ['function implementation()'];
  const proxyContract = new ethers.Contract(proxyAddress, abi, ethersProvider);
  return proxyContract.implementation();
};
