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
  const [feeManagerAddress, setFeeManagerAddress] = useState(
    homeMediatorAddress,
  );
  const [interfaceMajorVersion, setInterfaceMajorVersion] = useState();
  const [interfaceMinorVersion, setInterfaceMinorVersion] = useState();

  useEffect(() => {
    const processMediatorData = async () => {
      if (!account) return;
      const ethersProvider = await getEthersProvider(homeChainId);
      const abi = [
        'function getCurrentDay() view returns (uint256)',
        'function feeManager() public view returns (address)',
        'function getBridgeInterfacesVersion() external pure override returns (uint64, uint64, uint64)',
      ];

      const mediatorContract = new Contract(
        homeMediatorAddress,
        abi,
        ethersProvider,
      );

      mediatorContract
        .getBridgeInterfacesVersion()
        .then(version => {
          setInterfaceMajorVersion(version[0].toNumber());
          setInterfaceMinorVersion(version[1].toNumber());
        })
        .catch(bridgeVersionError => logError({ bridgeVersionError }));

      if (interfaceMajorVersion >= 2 && interfaceMinorVersion >= 1) {
        mediatorContract
          .feeManager()
          .then(feeManager => setFeeManagerAddress(feeManager))
          .catch(feeManagerAddressError =>
            logError({ feeManagerAddressError }),
          );
      }

      mediatorContract
        .getCurrentDay()
        .then(day => setCurrentDay(day))
        .catch(currentDayError => logError({ currentDayError }));
    };
    processMediatorData();
  }, [
    account,
    homeMediatorAddress,
    homeChainId,
    interfaceMinorVersion,
    interfaceMajorVersion,
  ]);

  return {
    currentDay,
    feeManagerAddress,
  };
};
