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
import Details from 'assets/details.svg';
import { BridgeContext } from 'contexts/BridgeContext';
import { formatValue } from 'lib/helpers';
import React, { useCallback, useContext, useState } from 'react';

export const SystemFeedback = () => {
  const { fromToken: token, tokenLimits, updateTokenLimits } = useContext(
    BridgeContext,
  );

  const [loading, setLoading] = useState(false);

  const update = useCallback(async () => {
    setLoading(true);
    await updateTokenLimits();
    setLoading(false);
  }, [updateTokenLimits]);

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
