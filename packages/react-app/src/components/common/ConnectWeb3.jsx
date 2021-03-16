import { Badge, Button, Flex, Text, Tooltip } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import { WalletFilledIcon } from 'icons/WalletFilledIcon';
import {
  FOREIGN_CHAIN_ID,
  HOME_CHAIN_ID,
  NON_ETH_CHAIN_IDS,
} from 'lib/constants';
import { getNetworkName, getWalletProviderName } from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import React from 'react';

export const ConnectWeb3 = () => {
  const {
    connectWeb3,
    loading,
    account,
    disconnect,
    ethersProvider,
  } = useWeb3Context();

  const renderConnectChain = chainId => {
    const networkName = getNetworkName(chainId);
    const isWalletMetamask =
      getWalletProviderName(ethersProvider) === 'metamask';

    return isWalletMetamask && NON_ETH_CHAIN_IDS.includes(chainId) ? (
      <Tooltip label={`Switch to ${networkName}`} position="auto">
        <Badge
          py={0.5}
          px={2}
          m={1}
          borderRadius={5}
          size="1"
          cursor="pointer"
          colorScheme="blue"
          onClick={() => addChainToMetaMask({ chainId })}
        >
          {networkName}
        </Badge>
      </Tooltip>
    ) : (
      networkName
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
            {account ? `Switch to a supported network` : 'Connect Wallet'}
          </Text>

          {!account ? (
            <Text color="greyText" mb={4} textAlign="center">
              To get started, connect your wallet
            </Text>
          ) : (
            <Text color="greyText" mb={4} textAlign="center">
              To access OmniBridge, please switch to
              {renderConnectChain(HOME_CHAIN_ID)}or{' '}
              {renderConnectChain(FOREIGN_CHAIN_ID)}
            </Text>
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
