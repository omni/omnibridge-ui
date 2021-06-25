import { useWeb3Context } from 'contexts/Web3Context';
import { fetchConfirmations } from 'lib/amb';
import { logError } from 'lib/helpers';
import { useEffect, useState } from 'react';

import { useBridgeDirection } from './useBridgeDirection';

export const useTotalConfirms = () => {
  const { homeChainId, homeAmbAddress, foreignAmbAddress } =
    useBridgeDirection();
  const { providerChainId, ethersProvider } = useWeb3Context();
  const [totalConfirms, setTotalConfirms] = useState(8);

  useEffect(() => {
    if (providerChainId && ethersProvider) {
      const ambAddress =
        providerChainId === homeChainId ? homeAmbAddress : foreignAmbAddress;
      fetchConfirmations(ambAddress, ethersProvider)
        .then(total => setTotalConfirms(total))
        .catch(confirmsError => logError({ confirmsError }));
    }
  }, [
    providerChainId,
    ethersProvider,
    homeChainId,
    homeAmbAddress,
    foreignAmbAddress,
  ]);

  return totalConfirms;
};
