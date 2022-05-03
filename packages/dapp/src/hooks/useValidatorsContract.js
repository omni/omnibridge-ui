import { getNetworkLabel, logError } from 'lib/helpers';
import { fetchRequiredSignatures, fetchValidatorList } from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useValidatorsContract = (homeChainId, homeAmbAddress) => {
  const [requiredSignatures, setRequiredSignatures] = useState(0);
  const [validatorList, setValidatorList] = useState([]);

  useEffect(() => {
    const label = getNetworkLabel(homeChainId).toUpperCase();
    const key = `${label}-${homeAmbAddress.toUpperCase()}-REQUIRED-SIGNATURES`;
    const fetchValue = async () => {
      try {
        const provider = await getEthersProvider(homeChainId);
        const res = await fetchRequiredSignatures(homeAmbAddress, provider);
        const signatures = Number.parseInt(res.toString(), 10);
        setRequiredSignatures(signatures);
        sessionStorage.setItem(key, signatures);
      } catch (versionError) {
        logError({ versionError });
      }
    };
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      setRequiredSignatures(Number.parseInt(storedValue, 10));
    } else {
      fetchValue();
    }
  }, [homeAmbAddress, homeChainId]);

  useEffect(() => {
    const label = getNetworkLabel(homeChainId).toUpperCase();
    const key = `${label}-${homeAmbAddress.toUpperCase()}-VALIDATOR-LIST`;
    const fetchValue = async () => {
      try {
        const provider = await getEthersProvider(homeChainId);
        const res = await fetchValidatorList(homeAmbAddress, provider);
        setValidatorList(res);
        sessionStorage.setItem(key, JSON.stringify(res));
      } catch (versionError) {
        logError({ versionError });
      }
    };
    const storedValue = sessionStorage.getItem(key);
    if (storedValue) {
      setValidatorList(JSON.parse(storedValue));
    } else {
      fetchValue();
    }
  }, [homeAmbAddress, homeChainId]);

  return { requiredSignatures, validatorList };
};
