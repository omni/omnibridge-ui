import { useBridgeContext } from 'contexts/BridgeContext';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { fetchTokenLimits } from 'lib/bridge';

const { useState, useCallback, useEffect } = require('react');

export const useTokenLimits = () => {
  const { fromToken, toToken, currentDay } = useBridgeContext();
  const { bridgeDirection, homeChainId, foreignChainId } = useBridgeDirection();
  const [tokenLimits, setTokenLimits] = useState();
  const [fetching, setFetching] = useState(false);

  const updateTokenLimits = useCallback(async () => {
    if (
      fromToken &&
      toToken &&
      fromToken.chainId &&
      toToken.chainId &&
      (fromToken.symbol.includes(toToken.symbol) ||
        toToken.symbol.includes(fromToken.symbol)) &&
      [homeChainId, foreignChainId].includes(fromToken.chainId) &&
      [homeChainId, foreignChainId].includes(toToken.chainId) &&
      bridgeDirection &&
      currentDay
    ) {
      setFetching(true);
      const limits = await fetchTokenLimits(
        bridgeDirection,
        fromToken,
        toToken,
        currentDay,
      );
      setTokenLimits(limits);
      setFetching(false);
    }
  }, [
    fromToken,
    toToken,
    bridgeDirection,
    homeChainId,
    foreignChainId,
    currentDay,
  ]);

  useEffect(() => updateTokenLimits(), [updateTokenLimits]);

  return { tokenLimits, fetching, refresh: updateTokenLimits };
};
