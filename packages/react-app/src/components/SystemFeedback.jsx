import {
  Flex,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import { utils } from 'ethers';
import React, { useContext } from 'react';

import Details from '../assets/details.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { formatValue } from '../lib/helpers';

export const SystemFeedback = () => {
  const { fromToken: token, tokenLimits } = useContext(BridgeContext);
  return (
    <Popover>
      <PopoverTrigger>
        <Flex
          align="center"
          color="blue.400"
          cursor="pointer"
          pb={{ base: 2, md: 0 }}
        >
          <Image src={Details} mr={2} />
          <Text>System Feedback</Text>
        </Flex>
      </PopoverTrigger>
      <PopoverContent
        boxShadow="0 0.5rem 1rem #CADAEF"
        border="none"
        minW="20rem"
        w="auto"
        maxW="30rem"
        // _focus={{ border: 'none', outline: 'none' }}
      >
        {token && tokenLimits && (
          <PopoverBody width="100%" align="center" fontSize="sm">
            <Flex align="center" justify="space-between">
              <Text color="grey"> Daily Limit </Text>
              <Text fontWeight="bold" ml={4}>
                {`${utils.commify(
                  formatValue(tokenLimits.dailyLimit, token.decimals),
                )} ${token.symbol}`}
              </Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Maximum per transaction </Text>
              <Text fontWeight="bold" ml={4}>
                {`${utils.commify(
                  formatValue(tokenLimits.maxPerTx, token.decimals),
                )} ${token.symbol}`}
              </Text>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Minimum per transaction </Text>
              <Text fontWeight="bold" ml={4}>
                {`${utils.commify(
                  formatValue(tokenLimits.minPerTx, token.decimals),
                )} ${token.symbol}`}
              </Text>
            </Flex>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
};
