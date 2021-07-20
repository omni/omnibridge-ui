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
import { formatValue } from 'lib/helpers';
import React, { useCallback, useState } from 'react';

export const SystemFeedback = () => {
  const {
    fromToken: token,
    tokenLimits,
    updateTokenLimits,
  } = useBridgeContext();

  const [loading, setLoading] = useState(false);

  const update = useCallback(async () => {
    setLoading(true);
    await updateTokenLimits();
    setLoading(false);
  }, [updateTokenLimits]);

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          onClick={update}
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
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {`${formatValue(tokenLimits.dailyLimit, token.decimals)} ${
                    token.symbol
                  }`}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey" textAlign="left">
                Max per Tx
              </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {`${formatValue(tokenLimits.maxPerTx, token.decimals)} ${
                    token.symbol
                  }`}
                </Text>
              )}
            </Flex>
            <Flex align="center" justify="space-between">
              <Text color="grey" textAlign="left">
                Min per Tx
              </Text>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <Text fontWeight="bold" ml={4} textAlign="right">
                  {`${formatValue(tokenLimits.minPerTx, token.decimals)} ${
                    token.symbol
                  }`}
                </Text>
              )}
            </Flex>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
};
