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
    const processMediatorData = async () => {
      if (!account) return;
      const ethersProvider = await getEthersProvider(homeChainId);
      const abi = [
        'function getCurrentDay() view returns (uint256)',
        'function feeManager() public view returns (address)',
        'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
      ];

      const mediatorContract = new Contract(
        homeMediatorAddress,
        abi,
        ethersProvider,
      );

      const setFeeManager = () => {
        mediatorContract
          .feeManager()
          .then(setFeeManagerAddress)
          .catch(feeManagerAddressError =>
            logError({ feeManagerAddressError }),
          );
      };

      mediatorContract
        .getBridgeInterfacesVersion()
        .then(versionArray => {
          const version = versionArray.map(v => v.toNumber()).join('.');
          if (version >= '2.1.0') {
            setFeeManager();
          } else {
            setFeeManagerAddress(homeMediatorAddress);
          }
        })
        .catch(bridgeVersionError => logError({ bridgeVersionError }));

      mediatorContract
        .getCurrentDay()
        .then(day => setCurrentDay(day))
        .catch(currentDayError => logError({ currentDayError }));
    };
    processMediatorData();
  }, [account, homeMediatorAddress, homeChainId]);

  return {
    currentDay,
    feeManagerAddress,
  };
};
