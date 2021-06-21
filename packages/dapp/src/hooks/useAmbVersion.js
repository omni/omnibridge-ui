import { fetchAmbVersion } from 'lib/amb';
import { getNetworkLabel, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useAmbVersion = (foreignChainId, foreignAmbAddress) => {
  const [foreignAmbVersion, setForeignAmbVersion] = useState();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const label = getNetworkLabel(foreignChainId).toUpperCase();
    const key = `${label}-AMB-VERSION`;
    const fetchVersion = async () => {
      const provider = await getEthersProvider(foreignChainId);
      await fetchAmbVersion(foreignAmbAddress, provider)
        .then(versionString => {
          setForeignAmbVersion(versionString);
          sessionStorage.setItem(key, versionString);
        })
        .catch(versionError => logError({ versionError }));
      setFetching(false);
    };
    const version = sessionStorage.getItem(key);
    if (!version && !fetching) {
      setFetching(true);
      fetchVersion();
    } else {
      setForeignAmbVersion(version);
    }
  }, [foreignAmbAddress, foreignChainId, fetching]);

  return foreignAmbVersion;
};
