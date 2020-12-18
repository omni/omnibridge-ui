import { Contract } from 'ethers';
import { useEffect, useState } from 'react';

import { CONFIG } from '../config';
import { getMediatorAddress } from '../lib/helpers';
import { getEthersProvider } from '../lib/providers';

export const useFeeType = () => {
  const [homeToForeignFeeType, setHomeToForeignFeeType] = useState(
    '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26',
  );
  const [foreignToHomeFeeType, setForeignToHomeFeeType] = useState(
    '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625',
  );
  const chainId = CONFIG.network;

  useEffect(() => {
    const ethersProvider = getEthersProvider(chainId);
    const mediatorAddress = getMediatorAddress(chainId);
    const abi = [
      'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
      'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
    ];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

    mediatorContract
      .FOREIGN_TO_HOME_FEE()
      .then(feeType => setForeignToHomeFeeType(feeType));
    mediatorContract
      .HOME_TO_FOREIGN_FEE()
      .then(feeType => setHomeToForeignFeeType(feeType));
  }, [setForeignToHomeFeeType, setHomeToForeignFeeType, chainId]);

  return { homeToForeignFeeType, foreignToHomeFeeType };
};
