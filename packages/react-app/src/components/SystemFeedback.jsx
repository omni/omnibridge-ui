import {
  Flex,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import React, { useContext, useState } from 'react';

import Details from '../assets/details.svg';
import { BridgeContext } from '../contexts/BridgeContext';

export const SystemFeedback = () => {
  const { fromToken: token, tokenLimits, updateTokenLimits } = useContext(
    BridgeContext,
  );

  const [loading, setLoading] = useState(false);

  const update = async () => {
    setLoading(true);
    await updateTokenLimits();
    setLoading(false);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Flex
          align="center"
          color="blue.400"
          cursor="pointer"
          pb={{ base: 2, md: 0 }}
          onClick={update}
        >
          <Image src={Details} mr={2} />
          <Text>System Feedback</Text>
        </Flex>
      </PopoverTrigger>
      <PopoverContent border="none" minW="20rem" w="auto" maxW="30rem" p="0">
        {token && tokenLimits && (
          <PopoverBody
            width="100%"
            align="center"
            fontSize="sm"
            boxShadow="0 0.5rem 1rem #CADAEF"
          >
            <Flex align="center" justify="space-between">
              <Text color="grey"> Daily Limit </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4}>
                  {`${utils.commify(
                    utils.formatUnits(tokenLimits.dailyLimit, token.decimals),
                  )} ${token.symbol}`}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Maximum per transaction </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4}>
                  {`${utils.commify(
                    utils.formatUnits(tokenLimits.maxPerTx, token.decimals),
                  )} ${token.symbol}`}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey"> Minimum per transaction </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4}>
                  {`${utils.commify(
                    utils.formatUnits(tokenLimits.minPerTx, token.decimals),
                  )} ${token.symbol}`}
                </Text>
              )}
            </Flex>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
};
