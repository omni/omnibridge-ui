import { useSettings } from 'contexts/SettingsContext';
import { networks } from 'lib/networks';
import { useCallback, useMemo } from 'react';

export const useBridgeDirection = () => {
  const { bridgeDirection } = useSettings();
  const bridgeConfig = useMemo(
    () => networks[bridgeDirection] || Object.values(networks)[0],
    [bridgeDirection],
  );

  const {
    homeChainId,
    foreignChainId,
    ambLiveMonitorPrefix,
    homeGraphName,
    foreignGraphName,
  } = bridgeConfig;

  const getBridgeChainId = useCallback(
    chainId => {
      return chainId === homeChainId ? foreignChainId : homeChainId;
    },
    [homeChainId, foreignChainId],
  );

  const getMonitorUrl = useCallback(
    (chainId, hash) => {
      return `${ambLiveMonitorPrefix}/${chainId}/${hash}`;
    },
    [ambLiveMonitorPrefix],
  );

  const getGraphEndpoint = useCallback(
    chainId => {
      const subgraphName =
        homeChainId === chainId ? homeGraphName : foreignGraphName;
      return `https://api.thegraph.com/subgraphs/name/${subgraphName}`;
    },
    [foreignGraphName, homeChainId, homeGraphName],
  );

  return {
    bridgeDirection,
    getBridgeChainId,
    getMonitorUrl,
    getGraphEndpoint,
    ...bridgeConfig,
  };
};
