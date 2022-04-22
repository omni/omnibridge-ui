import {
  Button,
  Flex,
  Image,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
} from '@chakra-ui/react';
import Details from 'assets/details.svg';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useTokenLimits } from 'hooks/useTokenLimits';
import { formatValueForLimits as formatValue } from 'lib/helpers';
import React from 'react';

export const SystemFeedback = () => {
  const { fromToken: token } = useBridgeContext();

  const { data: tokenLimits, fetching, refresh } = useTokenLimits();

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          onClick={refresh}
          variant="ghost"
          color="blue.500"
          _hover={{ bg: 'blackAlpha.100' }}
          fontWeight="normal"
          px="2"
        >
          <Image src={Details} mr={2} />
          <Text>System Feedback</Text>
        </Button>
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
              <Text color="grey" textAlign="left">
                Daily Limit
              </Text>
              {fetching ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {formatValue(tokenLimits.dailyLimit, token.decimals)}{' '}
                  {token.symbol}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey" textAlign="left">
                Max per Tx
              </Text>
              {fetching ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {formatValue(tokenLimits.maxPerTx, token.decimals)}{' '}
                  {token.symbol}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey" textAlign="left">
                Min per Tx
              </Text>
              {fetching ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {formatValue(tokenLimits.minPerTx, token.decimals)}{' '}
                  {token.symbol}
                </Text>
              )}
            </Flex>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
};
