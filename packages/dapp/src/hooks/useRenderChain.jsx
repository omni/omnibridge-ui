import { Badge, Image, Text, Tooltip, useToast } from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { useWeb3Context } from 'contexts/Web3Context';
// import { NON_ETH_CHAIN_IDS } from 'lib/constants';
import {
  getNetworkName,
  getWalletProviderName,
  handleWalletError,
  logError,
} from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import React, { useCallback } from 'react';

export const useRenderChain = () => {
  const { ethersProvider } = useWeb3Context();

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

  const addChain = useCallback(
    async chainId => {
      await addChainToMetaMask({ chainId }).catch(metamaskError => {
        logError({ metamaskError });
        handleWalletError(metamaskError, showError);
      });
    },
    [showError],
  );

  const renderChain = useCallback(
    (chainId, connect = true) => {
      const networkName = getNetworkName(chainId);
      const isWalletMetamask =
        getWalletProviderName(ethersProvider) === 'metamask';

      return isWalletMetamask &&
        // NON_ETH_CHAIN_IDS.includes(chainId) &&
        connect ? (
        <Tooltip label={`Click to switch to ${networkName}`} position="auto">
          <Badge
            display="inline-flex"
            alignItems="center"
            py={1}
            px={2}
            m={1}
            borderRadius={5}
            size="1"
            cursor="pointer"
            colorScheme="blue"
            onClick={() => addChain(chainId)}
          >
            <Image boxSize={5} src={MetamaskFox} mr={2} />
            {networkName}
          </Badge>
        </Tooltip>
      ) : (
        <Text
          as="span"
          fontWeight="bold"
          textTransform="uppercase"
          fontSize="0.9rem"
          color="black"
        >
          {' '}
          {networkName}
        </Text>
      );
    },
    [addChain, ethersProvider],
  );

  return renderChain;
};
