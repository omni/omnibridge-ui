import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { logDebug, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';
import { defer } from 'rxjs';

const { REACT_APP_RPC_HEALTH_UPDATE_INTERVAL } = process.env;

const DEFAULT_RPC_HEALTH_UPDATE_INTERVAL = 15000;

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

    const load = async () => {
      try {
        const homeProvider = await getEthersProvider(homeChainId);
        const homeHealth = homeProvider !== null;
        const foreignProvider = await getEthersProvider(foreignChainId);
        const foreignHealth = foreignProvider !== null;
        setHealthStatus({
          homeHealthy: homeHealth,
          foreignHealthy: foreignHealth,
        });
        logDebug({
          homeHealth,
          foreignHealth,
          message: 'updated rpc health data',
        });

        const timeoutId = setTimeout(() => load(), UPDATE_INTERVAL);
        subscriptions.push(timeoutId);
      } catch (graphHealthError) {
        logError({ graphHealthError });
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    const deferral = defer(() => load()).subscribe();
    // unsubscribe when unmount component
    return () => {
      unsubscribe();
      deferral.unsubscribe();
    };
  }, [foreignChainId, homeChainId]);

  return { homeHealthy, foreignHealthy };
};
