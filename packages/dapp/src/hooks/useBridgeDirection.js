import { useSettings } from 'contexts/SettingsContext';
import { useAmbVersion } from 'hooks/useAmbVersion';
import { useRequiredSignatures } from 'hooks/useRequiredSignatures';
import { useTotalConfirms } from 'hooks/useTotalConfirms';
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
    homeAmbAddress,
    foreignAmbAddress,
  } = bridgeConfig;

  const foreignAmbVersion = useAmbVersion(foreignChainId, foreignAmbAddress);

  const homeRequiredSignatures = useRequiredSignatures(
    homeChainId,
    homeAmbAddress,
  );

  const { homeTotalConfirms, foreignTotalConfirms } = useTotalConfirms(
    homeChainId,
    foreignChainId,
    homeAmbAddress,
    foreignAmbAddress,
  );

  const getBridgeChainId = useCallback(
    chainId => (chainId === homeChainId ? foreignChainId : homeChainId),
    [homeChainId, foreignChainId],
  );

  const getMonitorUrl = useCallback(
    (chainId, hash) => `${ambLiveMonitorPrefix}/${chainId}/${hash}`,
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

  const getAMBAddress = useCallback(
    chainId => (chainId === homeChainId ? homeAmbAddress : foreignAmbAddress),
    [homeChainId, homeAmbAddress, foreignAmbAddress],
  );

  const getTotalConfirms = useCallback(
    chainId =>
      chainId === homeChainId ? homeTotalConfirms : foreignTotalConfirms,
    [homeChainId, homeTotalConfirms, foreignTotalConfirms],
  );

  return {
    bridgeDirection,
    getBridgeChainId,
    getMonitorUrl,
    getGraphEndpoint,
    getAMBAddress,
    foreignAmbVersion,
    homeRequiredSignatures,
    homeTotalConfirms,
    foreignTotalConfirms,
    getTotalConfirms,
    ...bridgeConfig,
  };
};
