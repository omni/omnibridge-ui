import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { fetchAmbVersion } from 'lib/amb';
import { logError } from 'lib/helpers';
import { networks } from 'lib/networks';
import { useCallback, useMemo, useState } from 'react';

export const useBridgeDirection = () => {
  const { bridgeDirection } = useSettings();
  const { ethersProvider } = useWeb3Context();
  const [foreignAmbVersion, setForeignAmbVersion] = useState();
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
    foreignAmbAddress,
  } = bridgeConfig;

  useMemo(
    async version => {
      await fetchAmbVersion(foreignAmbAddress, ethersProvider)
        .then(res => {
          setForeignAmbVersion(res);
        })
        .catch(versionError => logError({ versionError }));
    },
    [foreignAmbAddress, ethersProvider],
  );

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
    foreignAmbVersion,
    ...bridgeConfig,
  };
};
