import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { getMediatorAddress, logError } from 'lib/helpers';
import { useEffect, useState } from 'react';

export const useCurrentDay = () => {
  const { ethersProvider, providerChainId: chainId } = useWeb3Context();
  const [currentDay, setCurrentDay] = useState();

  useEffect(() => {
    if (!ethersProvider) return;
    const mediatorAddress = getMediatorAddress(chainId);
    const abi = ['function getCurrentDay() view returns (uint256)'];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract
      .getCurrentDay()
      .then(day => setCurrentDay(day))
      .catch(currentDayError => logError({ currentDayError }));
  }, [ethersProvider, chainId]);

  return currentDay;
};
