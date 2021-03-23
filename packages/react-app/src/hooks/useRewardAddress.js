import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getMediatorAddress, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useRewardAddress = () => {
  const { bridgeDirection, homeChainId } = useBridgeDirection();
  const { account } = useWeb3Context();
  const [isRewardAddress, setRewardAddress] = useState(false);

  useEffect(() => {
    if (!account) return;
    const ethersProvider = getEthersProvider(homeChainId);
    const mediatorAddress = getMediatorAddress(bridgeDirection, homeChainId);
    const abi = ['function isRewardAddress(address) view returns (bool)'];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract
      .isRewardAddress(account)
      .then(is => setRewardAddress(is))
      .catch(rewardAddressError => logError({ rewardAddressError }));
  }, [account, bridgeDirection, homeChainId]);

  return isRewardAddress;
};
