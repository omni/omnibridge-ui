import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useUpdateInterval } from 'hooks/useUpdateInterval';
import { useMemo } from 'react';
import { getRPCHealth } from 'stores/rpcHealth';

export const useRPCHealth = () => {
  const { homeChainId, foreignChainId } = useBridgeDirection();

  const [refreshCount] = useUpdateInterval();

  const { [homeChainId]: homeHealthy, [foreignChainId]: foreignHealthy } =
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => getRPCHealth(), [refreshCount]);

  return {
    homeHealthy: homeHealthy === undefined ? true : homeHealthy,
    foreignHealthy: foreignHealthy === undefined ? true : foreignHealthy,
  };
};
