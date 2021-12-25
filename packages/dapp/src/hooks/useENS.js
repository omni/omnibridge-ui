import { ethers } from 'ethers';
import { getEthersProvider } from 'lib/providers';
import { useEffect, useState } from 'react';

export function useENS(address) {
  const [ensName, setENSName] = useState();

  useEffect(() => {
    async function resolveENS() {
      if (ethers.utils.isAddress(address)) {
        const provider = await getEthersProvider(1);
        const name = await provider.lookupAddress(address);
        if (name) setENSName(name);
      }
    }
    resolveENS();
  }, [address]);

  return { ensName };
}
