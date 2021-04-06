import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useFeeManager = ({ feeManagerAddress }) => {
  const { homeChainId } = useBridgeDirection();
  const { account } = useWeb3Context();
  const [isRewardAddress, setRewardAddress] = useState(false);
  const [homeToForeignFeeType, setHomeToForeignFeeType] = useState(
    '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26',
  );
  const [foreignToHomeFeeType, setForeignToHomeFeeType] = useState(
    '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625',
  );

  useEffect(() => {
    if (!account) return;
    const ethersProvider = getEthersProvider(homeChainId);
    const abi = [
      'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
      'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
      'function isRewardAddress(address) view returns (bool)',
    ];
    const feeManagerContract = new Contract(
      feeManagerAddress,
      abi,
      ethersProvider,
    );

    feeManagerContract
      .FOREIGN_TO_HOME_FEE()
      .then(feeType => setForeignToHomeFeeType(feeType))
      .catch(feeTypeError => logError({ feeTypeError }));

    feeManagerContract
      .HOME_TO_FOREIGN_FEE()
      .then(feeType => setHomeToForeignFeeType(feeType))
      .catch(feeTypeError => logError({ feeTypeError }));

    feeManagerContract
      .isRewardAddress(account)
      .then(is => setRewardAddress(is))
      .catch(rewardAddressError => logError({ rewardAddressError }));
  }, [account, feeManagerAddress, homeChainId]);

  return {
    isRewardAddress,
    homeToForeignFeeType,
    foreignToHomeFeeType,
  };
};
