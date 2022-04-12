import { fetchConfirmations } from 'lib/amb';
import { getNetworkLabel, logError } from 'lib/helpers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export const useTotalConfirms = (
  homeChainId,
  foreignChainId,
  homeAmbAddress,
  foreignAmbAddress,
) => {
  const [homeTotalConfirms, setHomeTotalConfirms] = useState(8);
  const [foreignTotalConfirms, setForeignTotalConfirms] = useState(8);

  useEffect(() => {
    const homeLabel = getNetworkLabel(homeChainId).toUpperCase();
    const homeKey = `${homeLabel}-${homeAmbAddress.toUpperCase()}-TOTAL-CONFIRMATIONS`;

    const foreignLabel = getNetworkLabel(foreignChainId).toUpperCase();
    const foreignKey = `${foreignLabel}-${foreignAmbAddress.toUpperCase()}-TOTAL-CONFIRMATIONS`;

    const fetchConfirms = async () => {
      try {
        const [homeProvider, foreignProvider] = await Promise.all([
          getEthersProvider(homeChainId),
          getEthersProvider(foreignChainId),
        ]);
        const [home, foreign] = await Promise.all([
          fetchConfirmations(homeAmbAddress, homeProvider),
          fetchConfirmations(foreignAmbAddress, foreignProvider),
        ]);
        setHomeTotalConfirms(home);
        setForeignTotalConfirms(foreign);
        sessionStorage.setItem(homeKey, home);
        sessionStorage.setItem(foreignKey, foreign);
      } catch (confirmsError) {
        logError({ confirmsError });
      }
    };

    const homeConfirms = sessionStorage.getItem(homeKey);
    const foreignConfirms = sessionStorage.getItem(foreignKey);
    if (homeConfirms && foreignConfirms) {
      setHomeTotalConfirms(Number.parseInt(homeConfirms, 10));
      setForeignTotalConfirms(Number.parseInt(foreignConfirms, 10));
    } else {
      fetchConfirms();
    }
  }, [homeChainId, foreignChainId, homeAmbAddress, foreignAmbAddress]);

  return { homeTotalConfirms, foreignTotalConfirms };
};
