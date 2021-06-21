import { getNetworkLabel, logError } from 'lib/helpers';
import { requiredSignatures as fetchRequiredSignatures } from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useRequiredSignatures = (homeChainId, homeAmbAddress) => {
  const [homeRequiredSignatures, setHomeRequiredSignatures] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    const label = getNetworkLabel(homeChainId).toUpperCase();
    const key = `${label}-REQUIRED-SIGNATURES`;
    const fetchVersion = async () => {
      const provider = await getEthersProvider(homeChainId);
      await fetchRequiredSignatures(homeAmbAddress, provider)
        .then(res => {
          const signatures = Number.parseInt(res.toString(), 10);
          setHomeRequiredSignatures(signatures);
          sessionStorage.setItem(key, signatures);
        })
        .catch(versionError => logError({ versionError }));
      setFetching(false);
    };
    const version = sessionStorage.getItem(key);
    if (!version && !fetching) {
      setFetching(true);
      fetchVersion();
    } else {
      setHomeRequiredSignatures(Number.parseInt(version, 10));
    }
  }, [homeAmbAddress, homeChainId, fetching]);

  return homeRequiredSignatures;
};
