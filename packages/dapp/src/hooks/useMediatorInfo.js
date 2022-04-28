import { useWeb3Context } from 'contexts/Web3Context';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useCallback, useEffect, useState } from 'react';

export const useMediatorInfo = () => {
  const { homeChainId, homeMediatorAddress } = useBridgeDirection();
  const [currentDay, setCurrentDay] = useState();
  const [feeManagerAddress, setFeeManagerAddress] = useState();
  const [fetching, setFetching] = useState(false);
  const { account } = useWeb3Context();

  const [isRewardAddress, setRewardAddress] = useState(false);
  const [homeToForeignFeeType, setHomeToForeignFeeType] = useState(
    '0x741ede137d0537e88e0ea0ff25b1f22d837903dbbee8980b4a06e8523247ee26',
  );
  const [foreignToHomeFeeType, setForeignToHomeFeeType] = useState(
    '0x03be2b2875cb41e0e77355e802a16769bb8dfcf825061cde185c73bf94f12625',
  );

  const calculateFees = useCallback(async (managerAddress, chainId) => {
    const ethersProvider = await getEthersProvider(chainId);
    const abi = [
      'function FOREIGN_TO_HOME_FEE() view returns (bytes32)',
      'function HOME_TO_FOREIGN_FEE() view returns (bytes32)',
    ];
    const feeManagerContract = new Contract(
      managerAddress,
      abi,
      ethersProvider,
    );

    const [home, foreign] = await Promise.all([
      feeManagerContract.FOREIGN_TO_HOME_FEE(),
      feeManagerContract.HOME_TO_FOREIGN_FEE(),
    ]);
    setForeignToHomeFeeType(home);
    setHomeToForeignFeeType(foreign);
  }, []);

  const checkRewardAddress = useCallback(
    async (managerAddress, chainId) => {
      if (!account) {
        setRewardAddress(false);
        return;
      }
      const ethersProvider = await getEthersProvider(chainId);
      const abi = ['function isRewardAddress(address) view returns (bool)'];
      const feeManagerContract = new Contract(
        managerAddress,
        abi,
        ethersProvider,
      );
      const is = await feeManagerContract.isRewardAddress(account);

      setRewardAddress(is);
    },
    [account],
  );

  useEffect(() => {
    const processMediatorData = async () => {
      try {
        setFetching(true);
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

        const [versionArray, day] = await Promise.all([
          mediatorContract.getBridgeInterfacesVersion(),
          mediatorContract.getCurrentDay(),
        ]);

        setCurrentDay(day);

        const version = versionArray.map(v => v.toNumber()).join('.');
        let managerAddress = homeMediatorAddress;
        if (version >= '2.1.0') {
          managerAddress = await mediatorContract.feeManager();
        }

        setFeeManagerAddress(managerAddress);
        await Promise.all([
          checkRewardAddress(managerAddress, homeChainId),
          calculateFees(managerAddress, homeChainId),
        ]);
      } catch (error) {
        logError('Error fetching mediator info:', error);
      } finally {
        setFetching(false);
      }
    };
    processMediatorData();
  }, [homeMediatorAddress, homeChainId, calculateFees, checkRewardAddress]);

  return {
    fetching,
    currentDay,
    feeManagerAddress,
    isRewardAddress,
    homeToForeignFeeType,
    foreignToHomeFeeType,
  };
};
