import { useSettings } from 'contexts/SettingsContext';
import { fetchAmbVersion } from 'lib/amb';
import { networkLabels } from 'lib/constants';
import { logError } from 'lib/helpers';
import { networks } from 'lib/networks';
import { getEthersProvider } from 'lib/providers';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useBridgeDirection = () => {
  const { bridgeDirection } = useSettings();
  const [foreignAmbVersion, setForeignAmbVersion] = useState();
  const [fetchingVersion, setFetchingVersion] = useState(false);
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

  useEffect(() => {
    const label = networkLabels[foreignChainId];
    const key = `${label}-AMB-VERSION`;
    const fetchVersion = async () => {
      const provider = await getEthersProvider(foreignChainId);
      await fetchAmbVersion(foreignAmbAddress, provider)
        .then(res => {
          setForeignAmbVersion(res);
          sessionStorage.setItem(key, JSON.stringify(res));
        })
        .catch(versionError => logError({ versionError }));
      setFetchingVersion(false);
    };
    const version = sessionStorage.getItem(key);
    if (!version && !fetchingVersion) {
      setFetchingVersion(true);
      fetchVersion();
    } else {
      setForeignAmbVersion(JSON.parse(version));
    }
  }, [foreignAmbAddress, foreignChainId, fetchingVersion]);

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
