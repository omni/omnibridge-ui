import { Button, Flex, Text } from '@chakra-ui/react';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useRenderChain } from 'hooks/useRenderChain';
import { WalletFilledIcon } from 'icons/WalletFilledIcon';
import React, { useCallback } from 'react';

export const ConnectWeb3 = () => {
  const {
    homeChainId,
    foreignChainId,
    label: bridgeLabel,
    getBridgeChainId,
  } = useBridgeDirection();
  const { queryToken } = useSettings();
  const queryChainId = queryToken ? queryToken.chainId : null;
  const { connectWeb3, loading, account, disconnect } = useWeb3Context();

  const renderChain = useRenderChain();

  const renderBridgeLabel = useCallback(
    () => (
      <Text
        as="span"
        fontWeight="bold"
        textTransform="uppercase"
        fontSize="0.9rem"
      >
        {bridgeLabel}
      </Text>
    ),
    [bridgeLabel],
  );

  const renderHelperBox = useCallback(() => {
    if (queryChainId && [homeChainId, foreignChainId].includes(queryChainId)) {
      return (
        <Text color="greyText" mb={4} textAlign="center">
          Please switch to {renderChain(queryChainId)} for bridging your tokens
          to {renderChain(getBridgeChainId(queryChainId), false)}
        </Text>
      );
    }
    return (
      <Text color="greyText" mb={4} textAlign="center">
        To access the {renderBridgeLabel()} OmniBridge, please switch to
        {renderChain(homeChainId)}
        or
        {renderChain(foreignChainId)}
      </Text>
    );
  }, [
    queryChainId,
    homeChainId,
    foreignChainId,
    renderBridgeLabel,
    renderChain,
    getBridgeChainId,
  ]);

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
      maxW="31rem"
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
            {account ? `Switch your network` : 'Connect Wallet'}
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
