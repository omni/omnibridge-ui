import { useToast } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getHealthStatus } from 'lib/graphHealth';
import { logDebug, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useRef, useState } from 'react';

const {
  REACT_APP_GRAPH_HEALTH_UPDATE_INTERVAL,
  REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS,
} = process.env;

const DEFAULT_GRAPH_HEALTH_UPDATE_INTERVAL = 60000;

const DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS = 10;

const UPDATE_INTERVAL =
  REACT_APP_GRAPH_HEALTH_UPDATE_INTERVAL ||
  DEFAULT_GRAPH_HEALTH_UPDATE_INTERVAL;

const THRESHOLD_BLOCKS =
  REACT_APP_GRAPH_HEALTH_THRESHOLD_BLOCKS ||
  DEFAULT_GRAPH_HEALTH_THRESHOLD_BLOCKS;

export const useGraphHealth = (
  description,
  options = { onlyHome: false, disableAlerts: false },
) => {
  const { onlyHome, disableAlerts } = options;
  const { bridgeDirection, homeChainId, foreignChainId } = useBridgeDirection();
  const { providerChainId } = useWeb3Context();

  const isHome = providerChainId === homeChainId;

  const [homeHealthy, setHomeHealthy] = useState(true);

  const [foreignHealthy, setForeignHealthy] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    let isSubscribed = true;
    const load = async () => {
      try {
        setLoading(true);
        const homeProvider = await getEthersProvider(homeChainId);
        const foreignProvider = await getEthersProvider(foreignChainId);
        if (!homeProvider || !foreignProvider) return;
        const [
          { homeHealth, foreignHealth },
          homeBlockNumber,
          foreignBlockNumber,
        ] = await Promise.all([
          getHealthStatus(bridgeDirection),
          homeProvider?.getBlockNumber(),
          foreignProvider?.getBlockNumber(),
        ]);
        logDebug('Updated Subgraph Health', {
          homeHealth,
          foreignHealth,
          homeBlockNumber,
          foreignBlockNumber,
        });

        const isHomeHealthy =
          homeHealth &&
          homeHealth.isReachable &&
          !homeHealth.isFailed &&
          homeHealth.isSynced &&
          Math.abs(homeHealth.latestBlockNumber - homeBlockNumber) <
            THRESHOLD_BLOCKS &&
          Math.abs(homeHealth.chainHeadBlockNumber - homeBlockNumber) <
            THRESHOLD_BLOCKS;

        const isForeignHealthy =
          foreignHealth &&
          foreignHealth.isReachable &&
          !foreignHealth.isFailed &&
          foreignHealth.isSynced &&
          Math.abs(foreignHealth.latestBlockNumber - foreignBlockNumber) <
            THRESHOLD_BLOCKS &&
          Math.abs(foreignHealth.chainHeadBlockNumber - foreignBlockNumber) <
            THRESHOLD_BLOCKS;

        if (isSubscribed) {
          setHomeHealthy(isHomeHealthy);
          setForeignHealthy(isForeignHealthy);
        }

        const timeoutId = setTimeout(() => load(), UPDATE_INTERVAL);
        subscriptions.push(timeoutId);
      } catch (graphHealthError) {
        logError({ graphHealthError });
      } finally {
        setLoading(false);
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    load();

    // unsubscribe when unmount component
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [bridgeDirection, foreignChainId, homeChainId]);

  const toast = useToast();
  const toastIdRef = useRef();

  useEffect(() => {
    if (!loading) {
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
    }
  }, [
    homeHealthy,
    foreignHealthy,
    loading,
    toast,
    onlyHome,
    isHome,
    disableAlerts,
    description,
  ]);

  return { homeHealthy, foreignHealthy };
};
