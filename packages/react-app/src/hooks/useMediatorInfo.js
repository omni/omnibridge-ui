import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useMediatorInfo = () => {
  const { homeChainId, homeMediatorAddress } = useBridgeDirection();
  const { account } = useWeb3Context();
  const [currentDay, setCurrentDay] = useState();
  const [feeManagerAddress, setFeeManagerAddress] = useState();

  useEffect(() => {
    if (!account) return;
    const ethersProvider = getEthersProvider(homeChainId);
    const abi = [
      'function getCurrentDay() view returns (uint256)',
      'function feeManager() public view returns (address)',
    ];
    const mediatorContract = new Contract(
      homeMediatorAddress,
      abi,
      ethersProvider,
    );

    mediatorContract
      .feeManager()
      .then(feeManager => setFeeManagerAddress(feeManager))
      .catch(feeManagerAddressError => logError({ feeManagerAddressError }));

    mediatorContract
      .getCurrentDay()
      .then(day => setCurrentDay(day))
      .catch(currentDayError => logError({ currentDayError }));
  }, [account, homeMediatorAddress, homeChainId]);

  return {
    currentDay,
    feeManagerAddress,
  };
};
