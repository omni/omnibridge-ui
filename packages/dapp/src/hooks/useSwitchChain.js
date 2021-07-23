import { useToast } from '@chakra-ui/react';
import { handleWalletError, logError } from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import { useCallback } from 'react';

export const useSwitchChain = () => {
  const toast = useToast();

  const showError = useCallback(
    msg => {
      if (msg) {
        toast({
          title: 'Error',
          description: msg,
          status: 'error',
          isClosable: 'true',
        });
      }
    },
    [toast],
  );

  return useCallback(
    async chainId => {
      const result = await addChainToMetaMask(chainId).catch(metamaskError => {
        logError({ metamaskError });
        handleWalletError(metamaskError, showError);
      });
      return result || false;
    },
    [showError],
  );
};
