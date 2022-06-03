import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useMemo } from 'react';
import { getGraphHealth } from 'stores/graphHealth';
import { getRPCHealth } from 'stores/rpcHealth';

import { useUpdateInterval } from './useUpdateInterval';

const { REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS } = process.env;

const DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS = 10;

const THRESHOLD_BLOCKS =
  REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS ||
  DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS;

export const useGraphHealth = () => {
  const { homeChainId, foreignChainId, homeGraphName, foreignGraphName } =
    useBridgeDirection();

  const [refreshCount] = useUpdateInterval();

  const [homeHealthy, foreignHealthy] = useMemo(() => {
    const {
      [homeChainId]: homeBlockNumber,
      [foreignChainId]: foreignBlockNumber,
    } = getRPCHealth();
    const { [homeGraphName]: homeHealth, [foreignGraphName]: foreignHealth } =
      getGraphHealth();

    const home =
      homeHealth && homeBlockNumber !== undefined
        ? homeHealth.isReachable &&
          !homeHealth.isFailed &&
          homeHealth.isSynced &&
          Math.abs(homeHealth.latestBlockNumber - homeBlockNumber) <
            THRESHOLD_BLOCKS &&
          Math.abs(homeHealth.chainHeadBlockNumber - homeBlockNumber) <
            THRESHOLD_BLOCKS
        : true;

    const foreign =
      foreignHealth && foreignBlockNumber !== undefined
        ? foreignHealth.isReachable &&
          !foreignHealth.isFailed &&
          foreignHealth.isSynced &&
          Math.abs(foreignHealth.latestBlockNumber - foreignBlockNumber) <
            THRESHOLD_BLOCKS &&
          Math.abs(foreignHealth.chainHeadBlockNumber - foreignBlockNumber) <
            THRESHOLD_BLOCKS
        : true;

    return [home, foreign];
    // for refreshCount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    refreshCount,
    homeChainId,
    foreignChainId,
    homeGraphName,
    foreignGraphName,
  ]);

  return { homeHealthy, foreignHealthy };
};
