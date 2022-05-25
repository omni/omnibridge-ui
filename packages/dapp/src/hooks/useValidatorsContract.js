import { getNetworkLabel, logError } from 'lib/helpers';
import { fetchRequiredSignatures, fetchValidatorList } from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useValidatorsContract = (foreignChainId, foreignAmbAddress) => {
  const [requiredSignatures, setRequiredSignatures] = useState(0);
  const [validatorList, setValidatorList] = useState([]);

  useEffect(() => {
    const label = getNetworkLabel(foreignChainId).toUpperCase();
    const key = `${label}-${foreignAmbAddress.toUpperCase()}-REQUIRED-SIGNATURES`;
    const fetchValue = async () => {
      try {
        const provider = await getEthersProvider(foreignChainId);
        const res = await fetchRequiredSignatures(foreignAmbAddress, provider);
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
  }, [foreignAmbAddress, foreignChainId]);

  useEffect(() => {
    const label = getNetworkLabel(foreignChainId).toUpperCase();
    const key = `${label}-${foreignAmbAddress.toUpperCase()}-VALIDATOR-LIST`;
    const fetchValue = async () => {
      try {
        const provider = await getEthersProvider(foreignChainId);
        const res = await fetchValidatorList(foreignAmbAddress, provider);
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
  }, [foreignAmbAddress, foreignChainId]);

  return { requiredSignatures, validatorList };
};
