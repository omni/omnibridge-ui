import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useMediatorInfo = () => {
  const { homeChainId, homeMediatorAddress } = useBridgeDirection();
  const { account } = useWeb3Context();
  const [isRewardAddress, setRewardAddress] = useState(false);
  const [currentDay, setCurrentDay] = useState();
  const [homeToForeignFeeType, setHomeToForeignFeeType] = useState(
    '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26',
  );
  const [foreignToHomeFeeType, setForeignToHomeFeeType] = useState(
    '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625',
  );

  useEffect(() => {
    if (!account) return;
    const processMediatorData = async () => {
      const ethersProvider = await getEthersProvider(homeChainId);
      const abi = [
        'function isRewardAddress(address) view returns (bool)',
        'function getCurrentDay() view returns (uint256)',
        'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
        'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
      ];
      const mediatorContract = new Contract(
        homeMediatorAddress,
        abi,
        ethersProvider,
      );

      mediatorContract
        .FOREIGN_TO_HOME_FEE()
        .then(feeType => setForeignToHomeFeeType(feeType))
        .catch(feeTypeError => logError({ feeTypeError }));

      mediatorContract
        .HOME_TO_FOREIGN_FEE()
        .then(feeType => setHomeToForeignFeeType(feeType))
        .catch(feeTypeError => logError({ feeTypeError }));

      mediatorContract
        .getCurrentDay()
        .then(day => setCurrentDay(day))
        .catch(currentDayError => logError({ currentDayError }));
      mediatorContract
        .isRewardAddress(account)
        .then(is => setRewardAddress(is))
        .catch(rewardAddressError => logError({ rewardAddressError }));
    };

    processMediatorData();
  }, [account, homeMediatorAddress, homeChainId]);

  return {
    isRewardAddress,
    currentDay,
    homeToForeignFeeType,
    foreignToHomeFeeType,
  };
};
