import { Flex, Image, Text } from '@chakra-ui/core';
import React, { useContext } from 'react';

import EthLogo from '../assets/eth-logo.png';
import xDAILogo from '../assets/xdai-logo.png';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { formatValue, isxDaiChain } from '../lib/helpers';

export const ToToken = () => {
  const { network } = useContext(Web3Context);
  const { toToken: token, toAmount: amount } = useContext(BridgeContext);
  const fallbackLogo = isxDaiChain(network.value) ? EthLogo : xDAILogo;
  return (
    <Flex align="center" ml={{ base: -4, md: -4, lg: -6 }} position="relative">
      <svg width="100%" viewBox="0 0 381 94" fill="none">
        <path
          d="M20.806 4.484A8 8 0 0127.992 0H373a8 8 0 018 8v78a8 8 0 01-8 8H27.992a8 8 0 01-7.186-4.484l-19.085-39a8 8 0 010-7.032l19.085-39z"
          fill="#EEF4FD"
        />
      </svg>
      {token && (
        <Flex
          position="absolute"
          w="100%"
          h="100%"
          direction="column"
          py={4}
          pr={4}
          pl={12}
        >
          <Flex justify="space-between" align="center" color="grey" mb={2}>
            <Text>{`Balance: ${formatValue(
              token.balance,
              token.decimals,
            )}`}</Text>
            <Text>{`\u2248 $${token.balanceInUsd}`}</Text>
          </Flex>
          <Flex justify="space-between" align="center" flex={1}>
            <Flex align="center">
              <Flex
                justify="center"
                align="center"
                background="white"
                border="1px solid #DAE3F0"
                w={8}
                h={8}
                overflow="hidden"
                borderRadius="50%"
                mr={2}
              >
                <Image
                  src={token.logoURI || fallbackLogo}
                  fallbackSrc={fallbackLogo}
                />
              </Flex>
              <Text fontSize="lg" fontWeight="bold">
                {token.name}
              </Text>
            </Flex>
            <Flex align="center">
              <Text fontWeight="bold" fontSize="3xl">
                {formatValue(amount, token.decimals)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
