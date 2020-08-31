import {
  Flex,
  Grid,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import React, { useContext } from 'react';

import Details from '../assets/details.svg';
import { Web3Context } from '../lib/Web3Context';
import { FromToken } from './FromToken';
import { ToToken } from './ToToken';
import { TransferButton } from './TransferButton';
import { UnlockButton } from './UnlockButton';

export const BridgeTokens = () => {
  const token = {
    symbol: 'STAKE',
  };
  const { network } = useContext(Web3Context);
  return (
    <Flex
      w="calc(100% - 2rem)"
      maxW="75rem"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      p={8}
      mx={4}
      my="auto"
    >
      <Flex w="100%" justify="space-between">
        <Flex align="flex-start" direction="column">
          <Text color="greyText" fontSize="sm">
            From
          </Text>
          <Text fontWeight="bold" fontSize="lg">
            {network.name}
          </Text>
        </Flex>
        <Flex align="flex-end" direction="column">
          <Text color="greyText" fontSize="sm">
            To
          </Text>
          <Text fontWeight="bold" fontSize="lg" textAlign="right">
            {network.bridge.name}
          </Text>
        </Flex>
      </Flex>
      <Grid templateColumns="2fr 1fr 2fr" width="100%" my={4}>
        <FromToken />
        <Flex direction="column" px={{ base: 2, md: 2, lg: 4 }}>
          <UnlockButton />
          <TransferButton />
        </Flex>
        <ToToken />
      </Grid>
      <Popover>
        <PopoverTrigger>
          <Flex align="center" color="blue.400" cursor="pointer">
            <Image src={Details} mr={2} />
            <Text>System Feedback</Text>
          </Flex>
        </PopoverTrigger>
        <PopoverContent
          boxShadow="0 0.5rem 1rem #CADAEF"
          border="none"
          _focus={{ border: 'none', outline: 'none' }}
        >
          <PopoverArrow />
          <PopoverBody width="100%" align="center" fontSize="sm">
            <Flex align="center" justify="space-between">
              <Text color="grey"> Daily Limit </Text>
              <Text fontWeight="bold"> 1,000,000.00 {token.symbol} </Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Maximum per transaction </Text>
              <Text fontWeight="bold"> 100,000.00 {token.symbol} </Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Minimum per transaction </Text>
              <Text fontWeight="bold"> 1.00 {token.symbol} </Text>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
