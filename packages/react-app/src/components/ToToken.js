import React from 'react';
import ethers from 'ethers';
import { Flex, Text, Image } from '@chakra-ui/core';
import xDAILogo from '../assets/xdai-logo.png';

function ToToken() {
  const token = {
    name: 'STAKE on xDai',
    balance: '290000000000000000000',
    balanceInUsd: '0',
    logo: xDAILogo,
    amount: '0',
  };
  return (
    <Flex align="center" ml={{ base: -4, md: -4, lg: -6 }} position="relative">
      <svg width="100%" viewBox="0 0 381 94" fill="none">
        <path
          d="M20.806 4.484A8 8 0 0127.992 0H373a8 8 0 018 8v78a8 8 0 01-8 8H27.992a8 8 0 01-7.186-4.484l-19.085-39a8 8 0 010-7.032l19.085-39z"
          fill="#EEF4FD"
        />
      </svg>
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
          <Text>{`Balance: ${ethers.utils.formatEther(token.balance)}`}</Text>
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
              <Image src={token.logo} />
            </Flex>
            <Text fontSize="lg" fontWeight="bold">
              {token.name}
            </Text>
          </Flex>
          <Flex align="center">
            <Text fontWeight="bold" fontSize="3xl">
              {ethers.utils.formatEther(token.amount)}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default ToToken;
