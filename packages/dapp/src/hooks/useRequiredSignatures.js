import { getNetworkLabel, logError } from 'lib/helpers';
import { requiredSignatures as fetchRequiredSignatures } from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useRequiredSignatures = (homeChainId, homeAmbAddress) => {
  const [homeRequiredSignatures, setHomeRequiredSignatures] = useState(0);

  useEffect(() => {
    const label = getNetworkLabel(homeChainId).toUpperCase();
    const key = `${label}-{${homeAmbAddress.toUpperCase()}}-REQUIRED-SIGNATURES`;
    const fetchVersion = async () => {
      try {
        const provider = await getEthersProvider(homeChainId);
        const res = await fetchRequiredSignatures(homeAmbAddress, provider);
        const signatures = Number.parseInt(res.toString(), 10);
        setHomeRequiredSignatures(signatures);
        sessionStorage.setItem(key, signatures);
      } catch (versionError) {
        logError({ versionError });
      }
    };
    const version = sessionStorage.getItem(key);
    if (version) {
      setHomeRequiredSignatures(Number.parseInt(version, 10));
    } else {
      fetchVersion();
    }
  }, [homeAmbAddress, homeChainId]);

  return homeRequiredSignatures;
};
