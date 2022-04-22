import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useMemo } from 'react';

export const useNeedsClaiming = () => {
  const { providerChainId } = useWeb3Context();
  const { fromToken } = useBridgeContext();
  const { homeChainId, claimDisabled, tokensClaimDisabled } =
    useBridgeDirection();

  const isHome = providerChainId === homeChainId;

  return useMemo(
    () =>
      isHome &&
      !claimDisabled &&
      !(tokensClaimDisabled ?? []).includes(fromToken?.address.toLowerCase()),
    [isHome, claimDisabled, tokensClaimDisabled, fromToken],
  );
};
