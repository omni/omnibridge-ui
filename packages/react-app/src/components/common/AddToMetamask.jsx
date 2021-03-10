import { Image, useToast } from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { useWeb3 } from 'contexts/Web3Context';
import { getNetworkName } from 'lib/helpers';
import { addTokenToMetamask } from 'lib/metamask';
import React from 'react';

export const AddToMetamask = ({ token, ...props }) => {
  const { providerChainId } = useWeb3();
  const toast = useToast();

  if (!window.ethereum) return null;

  const showError = msg => {
    if (msg) {
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        isClosable: 'true',
      });
    }
  };

  const addToken = () => {
    if (providerChainId !== token.chainId) {
      showError(`Please switch wallet to ${getNetworkName(token.chainId)}`);
    } else {
      addTokenToMetamask(token);
    }
  };

  return (
    <Image
      src={MetamaskFox}
      alt="metamask-fox"
      onClick={addToken}
      w="1rem"
      {...props}
    />
  );
};
