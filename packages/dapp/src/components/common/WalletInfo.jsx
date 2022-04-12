import { Button, Flex, Text } from '@chakra-ui/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useRenderChain } from 'hooks/useRenderChain';
import { WalletFilledIcon } from 'icons/WalletFilledIcon';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const WalletInfo = ({ close }) => {
  const { getBridgeChainId } = useBridgeDirection();
  const { fromToken } = useBridgeContext();
  const tokenChainId = fromToken ? fromToken.chainId : null;
  const { isConnected, providerChainId, disconnect } = useWeb3Context();

  const renderChain = useRenderChain();

  if (!isConnected) return null;

  const isInvalid = tokenChainId !== providerChainId;

  return (
    <Flex background="white" direction="column" align="center" w="100%">
      <Flex
        bg={isInvalid ? 'red.500' : 'blue.500'}
        borderRadius="50%"
        p="0.75rem"
        justify="center"
        align="center"
        color="white"
        mb={4}
      >
        <WalletFilledIcon boxSize="1.25rem" />
      </Flex>
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        {isInvalid
          ? 'Switch your network'
          : `Connected to ${getNetworkName(providerChainId)}`}
      </Text>
      {isInvalid && (
        <Text color="greyText" mb={4} textAlign="center">
          Please switch to {renderChain(tokenChainId)} for bridging your tokens
          to {getNetworkName(getBridgeChainId(tokenChainId))}
        </Text>
      )}

      <Button
        onClick={() => {
          close();
          disconnect();
        }}
        colorScheme="blue"
        px={12}
      >
        Disconnect
      </Button>
    </Flex>
  );
};
