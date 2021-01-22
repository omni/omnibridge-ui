import { Contract } from 'ethers';
import { useContext, useEffect, useState } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { getMediatorAddress, logError } from '../lib/helpers';

export const useCurrentDay = () => {
  const { ethersProvider, providerChainId: chainId } = useContext(Web3Context);
  const [currentDay, setCurrentDay] = useState();

  useEffect(() => {
    if (!ethersProvider) return;
    const mediatorAddress = getMediatorAddress(chainId);
    const abi = ['function getCurrentDay() view returns (uint256)'];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract
      .getCurrentDay()
      .then(day => setCurrentDay(day))
      .catch(contractError => logError({ contractError }));
  }, [ethersProvider, setCurrentDay, chainId]);

  return currentDay;
};
