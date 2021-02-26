import { ethers } from 'ethers';
import memoize from 'fast-memoize';
import { getRPCUrl, isxDaiChain } from 'lib/helpers';

const memoized = memoize(url => new ethers.providers.JsonRpcProvider(url));

export const getEthersProvider = chainId => {
  const localRPCUrl = window.localStorage.getItem(
    isxDaiChain(chainId) ? 'xdai-rpc-url' : 'mainnet-rpc-url',
  );
  const rpcURL = localRPCUrl || getRPCUrl(chainId);
  return memoized(rpcURL);
};

export const isEIP1193 = ethersProvider =>
  ethersProvider &&
  ethersProvider.connection &&
  ethersProvider.connection.url &&
  ethersProvider.connection.url.includes('eip-1193');
