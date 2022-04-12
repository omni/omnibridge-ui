import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useMediatorInfo } from 'hooks/useMediatorInfo';
import { fetchTokenLimits } from 'lib/bridge';

const { useState, useCallback, useEffect } = require('react');

export const useTokenLimits = () => {
  const { currentDay } = useMediatorInfo();
  const { providerChainId, ethersProvider } = useWeb3Context();
  const { fromToken, toToken } = useBridgeContext();
  const { getBridgeChainId, bridgeDirection } = useBridgeDirection();
  const [tokenLimits, setTokenLimits] = useState();
  const [fetching, setFetching] = useState(false);

  const updateTokenLimits = useCallback(async () => {
    if (
      providerChainId &&
      ethersProvider &&
      fromToken &&
      toToken &&
      fromToken.chainId === providerChainId &&
      toToken.chainId === getBridgeChainId(providerChainId) &&
      fromToken.symbol === toToken.symbol &&
      currentDay &&
      bridgeDirection
    ) {
      setFetching(true);
      const limits = await fetchTokenLimits(
        bridgeDirection,
        ethersProvider,
        fromToken,
        toToken,
        currentDay,
      );
      setTokenLimits(limits);
      setFetching(false);
    }
  }, [
    providerChainId,
    fromToken,
    toToken,
    getBridgeChainId,
    ethersProvider,
    currentDay,
    bridgeDirection,
  ]);

  useEffect(() => updateTokenLimits(), [updateTokenLimits]);

  return { data: tokenLimits, fetching, refresh: updateTokenLimits };
};
