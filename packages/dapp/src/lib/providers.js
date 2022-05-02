import { setRPCHealth } from 'stores/rpcHealth';

import { getValidEthersProvider } from './providerHelpers';

export const getEthersProvider = async chainId => {
  const provider = await getValidEthersProvider(chainId);
  if (provider) {
    provider
      .getBlockNumber()
      .then(health => setRPCHealth(chainId, health))
      .catch();
  }
  return provider;
};

export const isEIP1193 = ethersProvider =>
  ethersProvider &&
  ethersProvider.connection &&
  ethersProvider.connection.url &&
  ethersProvider.connection.url.includes('eip-1193');
