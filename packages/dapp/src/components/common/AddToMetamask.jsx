import { Image, useDisclosure, useToast } from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { AddToMetamaskModal } from 'components/modals/AddToMetamaskModal';
import { useWeb3Context } from 'contexts/Web3Context';
import { ADDRESS_ZERO } from 'lib/constants';
import { getNetworkName, logError } from 'lib/helpers';
import { addTokenToMetamask } from 'lib/metamask';
import React, { useCallback } from 'react';

export const AddToMetamask = ({ token, asModal = false, ...props }) => {
  const { providerChainId, isMetamask } = useWeb3Context();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const showError = useCallback(
    msg => {
      if (msg) {
        toast({
          title: 'Error: Unable to add token',
          description: msg,
          status: 'error',
          isClosable: 'true',
        });
      }
    },
    [toast],
  );

  const addToken = useCallback(async () => {
    if (providerChainId !== token.chainId) {
      showError(`Please switch wallet to ${getNetworkName(token.chainId)}`);
    } else {
      await addTokenToMetamask(token).catch(metamaskError => {
        logError({ metamaskError });
        if (metamaskError && metamaskError.message) {
          showError(
            `Please add the token ${token.address} manually in the wallet app. Got message: "${metamaskError.message}"`,
          );
        }
      });
    }
  }, [showError, token, providerChainId]);

  const onClick = useCallback(() => {
    if (asModal) {
      onOpen();
    } else {
      addToken();
    }
  }, [onOpen, asModal, addToken]);

  return isMetamask && token.address !== ADDRESS_ZERO ? (
    <>
      <Image
        cursor="pointer"
        src={MetamaskFox}
        alt="metamask-fox"
        onClick={onClick}
        w="1rem"
        {...props}
      />
      {asModal && isOpen && (
        <AddToMetamaskModal isOpen={isOpen} onClose={onClose} token={token} />
      )}
    </>
  ) : null;
};
