import { abis } from '@project/contracts';
import ethers from 'ethers';

import { getEthersProvider } from './providers';

export const fetchImplementation = async (proxyAddress, chainId) => {
  const ethersProvider = getEthersProvider(chainId);
  const proxyContract = new ethers.Contract(
    proxyAddress,
    abis.proxy,
    ethersProvider,
  );
  return proxyContract.implementation();
};
