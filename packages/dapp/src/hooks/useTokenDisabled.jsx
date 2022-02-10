import {
  isBSCPeggedToken,
  isGCStableToken,
} from 'components/warnings/BSCGCTokenWarnings';
import { isERC20DaiAddress } from 'components/warnings/DaiWarning';
import { isRebasingToken } from 'components/warnings/RebasingTokenWarning';
import { isSafeMoonToken } from 'components/warnings/SafeMoonTokenWarning';
import { isDisabledStakeToken } from 'components/warnings/StakeTokenWarning';
import { Contract } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import {
  ADDRESS_ZERO,
  BSC_XDAI_BRIDGE,
  ETH_BSC_BRIDGE,
  ETH_XDAI_BRIDGE,
} from 'lib/constants';
import { logError } from 'lib/helpers';
import { networks } from 'lib/networks';
import { getEthersProvider } from 'lib/providers';
import { useCallback, useEffect, useState } from 'react';

const GC_BSC_OMNIBRIDGE = networks[BSC_XDAI_BRIDGE].foreignMediatorAddress;

export const useTokenGCOriginOnBSC = token => {
  const { bridgeDirection } = useBridgeDirection();
  const [fetching, setFetching] = useState(true);
  const [isToken, setIsToken] = useState(false);
  const load = useCallback(async () => {
    setFetching(true);
    try {
      if (token && token.chainId === 56 && bridgeDirection === ETH_BSC_BRIDGE) {
        const provider = await getEthersProvider(56);
        const abi = [
          'function nativeTokenAddress(address) view returns (address)',
        ];
        const contract = new Contract(GC_BSC_OMNIBRIDGE, abi, provider);

        const address = await contract.nativeTokenAddress(token.address);
        setIsToken(address !== ADDRESS_ZERO);
      } else {
        setIsToken(false);
      }
    } catch (error) {
      logError({ message: 'Error fetching nativeTokenAddress', error });
      setIsToken(false);
    } finally {
      setFetching(false);
    }
  }, [token, bridgeDirection]);

  useEffect(() => load(), [load]);
  return { fetching, isToken };
};

export const useTokenDisabled = token => {
  const { bridgeDirection } = useBridgeDirection();
  const { isToken: isTokenGCOriginOnBSC, fetching } =
    useTokenGCOriginOnBSC(token);

  if (!token || fetching) return false;
  const isTokenRebasing = isRebasingToken(token);
  const isTokenSafeMoon = isSafeMoonToken(token);
  const isTokenDisabledStake = isDisabledStakeToken(token);
  const isTokenBSCPegged =
    isBSCPeggedToken(token) && bridgeDirection === BSC_XDAI_BRIDGE;
  const isTokenGCStableToBSC =
    isGCStableToken(token) && bridgeDirection === BSC_XDAI_BRIDGE;
  const isTokenDAI =
    isERC20DaiAddress(token) && bridgeDirection === ETH_XDAI_BRIDGE;
  return (
    isTokenRebasing ||
    isTokenSafeMoon ||
    isTokenDisabledStake ||
    isTokenGCStableToBSC ||
    isTokenGCOriginOnBSC ||
    isTokenDAI ||
    isTokenBSCPegged
  );
};
