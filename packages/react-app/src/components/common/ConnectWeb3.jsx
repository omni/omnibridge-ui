import {
  Badge,
  Button,
  Flex,
  Image,
  Text,
  Tooltip,
  useToast,
} from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { useWeb3Context } from 'contexts/Web3Context';
import { WalletFilledIcon } from 'icons/WalletFilledIcon';
import {
  FOREIGN_CHAIN_ID,
  HOME_CHAIN_ID,
  NON_ETH_CHAIN_IDS,
} from 'lib/constants';
import { getNetworkName, getWalletProviderName, logError } from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import React from 'react';

export const ConnectWeb3 = () => {
  const {
    connectWeb3,
    loading,
    account,
    disconnect,
    ethersProvider,
    isChainIdInjected,
  } = useWeb3Context();
  const toast = useToast();

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

  const addChain = async chainId => {
    await addChainToMetaMask({ chainId }).catch(metamaskError => {
      logError({ metamaskError });
      if (metamaskError?.message) {
        showError(metamaskError.message);
      }
    });
  };

  const renderConnectChain = chainId => {
    const networkName = getNetworkName(chainId);
    const isWalletMetamask =
      getWalletProviderName(ethersProvider) === 'metamask';

    return isWalletMetamask && NON_ETH_CHAIN_IDS.includes(chainId) ? (
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
      <span style={{ fontWeight: 'bold' }}>{networkName}</span>
    );
  };

  const renderHelperBox = () => {
    const { chainId, status } = isChainIdInjected;
    if (status && [HOME_CHAIN_ID, FOREIGN_CHAIN_ID].includes(chainId)) {
      return (
        <Text color="greyText" mb={4} textAlign="center">
          Please switch to {renderConnectChain(isChainIdInjected.chainId)} for
          swapping
        </Text>
      );
    }
    return (
      <Text color="greyText" mb={4} textAlign="center">
        To access OmniBridge, please switch to
        {renderConnectChain(HOME_CHAIN_ID)}or{' '}
        {renderConnectChain(FOREIGN_CHAIN_ID)}
      </Text>
    );
  };

  return (
    <Flex
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      w="calc(100% - 2rem)"
      mt="5rem"
      p="2rem"
      maxW="27.5rem"
      mx={4}
    >
      <Flex
        bg={account && !loading ? 'red.500' : 'blue.500'}
        borderRadius="50%"
        p="1rem"
        justify="center"
        align="center"
        color="white"
        mb={4}
      >
        <WalletFilledIcon boxSize="1.75rem" />
      </Flex>
      {loading ? (
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          Connecting Wallet
        </Text>
      ) : (
        <>
          <Text fontSize="xl" fontWeight="bold" mb={4}>
            {account
              ? `Switch to a ${
                  isChainIdInjected.status ? 'chosen' : 'supported'
                } network`
              : 'Connect Wallet'}
          </Text>

          {!account ? (
            <Text color="greyText" mb={4} textAlign="center">
              To get started, connect your wallet
            </Text>
          ) : (
            renderHelperBox()
          )}
        </>
      )}
      {account && !loading ? (
        <Button onClick={disconnect} colorScheme="blue" px={12}>
          Disconnect
        </Button>
      ) : (
        <Button
          onClick={connectWeb3}
          colorScheme="blue"
          px={12}
          isLoading={loading}
        >
          Connect
        </Button>
      )}
    </Flex>
  );
};
