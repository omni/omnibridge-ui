import { Contract } from 'ethers';
import { useContext, useEffect, useState } from 'react';

import { CONFIG } from '../config';
import { Web3Context } from '../contexts/Web3Context';
import { getMediatorAddress } from '../lib/helpers';
import { getEthersProvider } from '../lib/providers';

export const useRewardAddress = () => {
  const { account } = useContext(Web3Context);
  const [isRewardAddress, setRewardAddress] = useState(false);
  const chainId = CONFIG.network;

  useEffect(() => {
    if (!account) return;
    const ethersProvider = getEthersProvider(chainId);
    const mediatorAddress = getMediatorAddress('', chainId);
    const abi = ['function isRewardAddress(address) view returns (bool)'];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract.isRewardAddress(account).then(is => setRewardAddress(is));
  }, [account, setRewardAddress, chainId]);

  return isRewardAddress;
};
