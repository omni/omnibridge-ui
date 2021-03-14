import { Button, ButtonGroup, Flex, Text } from '@chakra-ui/react';
import { Web3Context } from 'contexts/Web3Context';
import { WalletFilledIcon } from 'icons/WalletFilledIcon';
import { FOREIGN_CHAIN_ID, HOME_CHAIN_ID } from 'lib/constants';
import { getNetworkName, getWalletProviderName } from 'lib/helpers';
import { addChainToMetaMask } from 'lib/metamask';
import React, { useContext } from 'react';

export const ConnectWeb3 = () => {
  const {
    connectWeb3,
    loading,
    account,
    disconnect,
    ethersProvider,
  } = useContext(Web3Context);

  const renderDisconnectButton = () => {
    return getWalletProviderName(ethersProvider) === 'metamask' ? (
      <ButtonGroup spacing={3} width="100%" mt={2}>
        <Button onClick={disconnect} colorScheme="blue" px={12}>
          Disconnect
        </Button>
        <Button
          onClick={() => addChainToMetaMask({ chainId: HOME_CHAIN_ID })}
          colorScheme="pink"
          px={10}
        >
          Add {getNetworkName(HOME_CHAIN_ID)} to MetaMask
        </Button>
      </ButtonGroup>
    ) : (
      <Button onClick={disconnect} colorScheme="blue" px={12}>
        Disconnect
      </Button>
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
      p="2.5rem"
      maxW="32.5rem"
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
          <Text color="greyText" mb={4} textAlign="center">
            {account
              ? `To access OmniBridge, please switch to${' '}
                ${getNetworkName(HOME_CHAIN_ID)} or ${getNetworkName(
                  FOREIGN_CHAIN_ID,
                )}`
              : 'To get started, connect your wallet'}
          </Text>
        </>
      )}
      {account && !loading ? (
        renderDisconnectButton()
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
