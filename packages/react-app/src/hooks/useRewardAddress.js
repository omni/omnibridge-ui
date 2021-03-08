import { Web3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { HOME_CHAIN_ID } from 'lib/constants';
import { getMediatorAddress, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useContext, useEffect, useState } from 'react';

export const useRewardAddress = () => {
  const { account } = useContext(Web3Context);
  const [isRewardAddress, setRewardAddress] = useState(false);
  const chainId = HOME_CHAIN_ID;

  useEffect(() => {
    if (!account) return;
    const ethersProvider = getEthersProvider(chainId);
    const mediatorAddress = getMediatorAddress(chainId);
    const abi = ['function isRewardAddress(address) view returns (bool)'];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract
      .isRewardAddress(account)
      .then(is => setRewardAddress(is))
      .catch(contractError => logError({ contractError }));
  }, [account, setRewardAddress, chainId]);

  return isRewardAddress;
};
