import ethers from 'ethers';
import memoize from 'fast-memoize';

import { getRPCUrl } from './helpers';

const rawGetEthersProvider = chainId =>
  new ethers.providers.JsonRpcProvider(getRPCUrl(chainId));
const memoized = memoize(rawGetEthersProvider);

export const getEthersProvider = chainId => memoized(chainId);
