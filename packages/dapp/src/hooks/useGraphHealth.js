import { useToast } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useEffect, useMemo, useRef } from 'react';
import { getGraphHealth } from 'stores/graphHealth';
import { getRPCHealth } from 'stores/rpcHealth';

import { useUpdateInterval } from './useUpdateInterval';

const { REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS } = process.env;

const DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS = 10;

const THRESHOLD_BLOCKS =
  REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS ||
  DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS;

export const useGraphHealth = (
  description,
  options = { onlyHome: false, disableAlerts: false },
) => {
  const { onlyHome, disableAlerts } = options;
  const { homeChainId, foreignChainId, homeGraphName, foreignGraphName } =
    useBridgeDirection();
  const { providerChainId } = useWeb3Context();

  const isHome = providerChainId === homeChainId;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    refreshCount,
    homeChainId,
    foreignChainId,
    homeGraphName,
    foreignGraphName,
  ]);

  const toast = useToast();
  const toastIdRef = useRef();

  useEffect(() => {
    if (toastIdRef.current) {
      toast.close(toastIdRef.current);
    }
    if (!(homeHealthy && foreignHealthy)) {
      if ((onlyHome === true && !isHome) || disableAlerts === true) return;
      toastIdRef.current = toast({
        title: 'Subgraph Error',
        description,
        status: 'error',
        duration: null,
        isClosable: false,
      });
    }
  }, [
    homeHealthy,
    foreignHealthy,
    toast,
    isHome,
    disableAlerts,
    description,
    onlyHome,
  ]);

  return { homeHealthy, foreignHealthy };
};
