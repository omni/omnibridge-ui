import { useBridgeContext } from 'contexts/BridgeContext';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useMediatorInfo } from 'hooks/useMediatorInfo';
import { fetchTokenLimits } from 'lib/bridge';
import { ADDRESS_ZERO } from 'lib/constants';

const { useState, useCallback, useEffect } = require('react');

export const useTokenLimits = () => {
  const { currentDay } = useMediatorInfo();
  const { fromToken, toToken } = useBridgeContext();
  const { bridgeDirection } = useBridgeDirection();
  const [tokenLimits, setTokenLimits] = useState();
  const [fetching, setFetching] = useState(false);

  const updateTokenLimits = useCallback(async () => {
    if (
      fromToken?.chainId &&
      toToken?.chainId &&
      (fromToken?.symbol === toToken?.symbol ||
        (fromToken?.address === ADDRESS_ZERO && fromToken?.mode === 'NATIVE') ||
        (toToken?.address === ADDRESS_ZERO && toToken?.mode === 'NATIVE')) &&
      currentDay &&
      bridgeDirection
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
  }, [fromToken, toToken, currentDay, bridgeDirection]);

  useEffect(() => updateTokenLimits(), [updateTokenLimits]);

  return { data: tokenLimits, fetching, refresh: updateTokenLimits };
};
