import { ethers } from 'ethers';
import memoize from 'fast-memoize';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import { getRPCUrl } from 'lib/helpers';

const {
  MAINNET_RPC_URL,
  KOVAN_RPC_URL,
  BSC_RPC_URL,
  SOKOL_RPC_URL,
  XDAI_RPC_URL,
} = LOCAL_STORAGE_KEYS;

const RPC_URL = {
  1: MAINNET_RPC_URL,
  42: KOVAN_RPC_URL,
  56: BSC_RPC_URL,
  77: SOKOL_RPC_URL,
  100: XDAI_RPC_URL,
};

const memoized = memoize(
  url => new ethers.providers.StaticJsonRpcProvider(url),
);

export const getEthersProvider = chainId => {
  const localRPCUrl = window.localStorage.getItem(
    RPC_URL[chainId] || RPC_URL[1],
  );
  const rpcURL = localRPCUrl || getRPCUrl(chainId);
  return memoized(rpcURL);
};

export const isEIP1193 = ethersProvider =>
  ethersProvider &&
  ethersProvider.connection &&
  ethersProvider.connection.url &&
  ethersProvider.connection.url.includes('eip-1193');
