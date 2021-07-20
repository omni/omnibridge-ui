import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logDebug, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

const { REACT_APP_RPC_HEALTH_UPDATE_INTERVAL } = process.env;

const DEFAULT_RPC_HEALTH_UPDATE_INTERVAL = 60000;

const UPDATE_INTERVAL =
  REACT_APP_RPC_HEALTH_UPDATE_INTERVAL || DEFAULT_RPC_HEALTH_UPDATE_INTERVAL;

export const useRPCHealth = () => {
  const { homeChainId, foreignChainId } = useBridgeDirection();

  const [{ homeHealthy, foreignHealthy }, setHealthStatus] = useState({
    homeHealthy: true,
    foreignHealthy: true,
  });

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
        const homeProvider = await getEthersProvider(homeChainId);
        const homeHealth = homeProvider !== null;
        const foreignProvider = await getEthersProvider(foreignChainId);
        const foreignHealth = foreignProvider !== null;

        if (isSubscribed) {
          setHealthStatus({
            homeHealthy: homeHealth,
            foreignHealthy: foreignHealth,
          });
        }
        logDebug('Updated RPC Health', {
          homeHealth,
          foreignHealth,
        });

        const timeoutId = setTimeout(() => load(), UPDATE_INTERVAL);
        subscriptions.push(timeoutId);
      } catch (graphHealthError) {
        logError({ graphHealthError });
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
  }, [foreignChainId, homeChainId]);

  return { homeHealthy, foreignHealthy };
};
