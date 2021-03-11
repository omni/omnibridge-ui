import { ethers } from 'ethers';
import memoize from 'fast-memoize';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import { getRPCUrl, isxDaiChain } from 'lib/helpers';

const { MAINNET_RPC_URL, XDAI_RPC_URL } = LOCAL_STORAGE_KEYS;

const memoized = memoize(
  url => new ethers.providers.StaticJsonRpcProvider(url),
);

export const getEthersProvider = chainId => {
  const localRPCUrl = window.localStorage.getItem(
    isxDaiChain(chainId) ? XDAI_RPC_URL : MAINNET_RPC_URL,
  );
  const rpcURL = localRPCUrl || getRPCUrl(chainId);
  return memoized(rpcURL);
};

export const isEIP1193 = ethersProvider =>
  ethersProvider &&
  ethersProvider.connection &&
  ethersProvider.connection.url &&
  ethersProvider.connection.url.includes('eip-1193');
