import {
  Box,
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { utils } from 'ethers';
import { LimitsIcon } from 'icons/LimitsIcon';
import { formatValueForLimits as formatValue } from 'lib/helpers';
import React from 'react';

export const SystemFeedback = ({ tokenLimits, fetching, refresh }) => {
  const { fromToken: token } = useBridgeContext();

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          onClick={refresh}
          variant="ghost"
          color="blue.500"
          _hover={{ bg: '#EEF4FD' }}
          fontWeight="normal"
          leftIcon={<LimitsIcon boxSize="1.5rem" />}
          px="2"
        >
          <Text>Limits</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent border="none" minW="25rem" w="auto" maxW="35rem" p={0}>
        {token && tokenLimits && (
          <PopoverBody
            width="100%"
            align="center"
            fontSize="sm"
            boxShadow="0 0.5rem 1rem #CADAEF"
            px="1.5rem"
            py="1rem"
          >
            <VStack spacing="0.5rem" w="100%" align="stretch">
              <Flex align="center" justify="space-between">
                <Text color="grey" textAlign="left">
                  Daily Limit
                </Text>
                {fetching ? (
                  <Spinner size="sm" />
                ) : (
                  <Box>
                    {tokenLimits.dailyLimit.gte(
                      utils.parseEther('1000000000000000'), // greater than 999 trillion is infinity
                    ) ? (
                      <Text
                        fontWeight="bold"
                        ml={4}
                        textAlign="right"
                        lineHeight="21px"
                        fontSize="xl"
                      >
                        ∞
                      </Text>
                    ) : (
                      <Text fontWeight="bold" ml={4} textAlign="right">
                        <Text as="span" color="#4DA9A6">
                          {formatValue(
                            tokenLimits.dailyLimit.sub(
                              tokenLimits.remainingLimit,
                            ),
                            token.decimals,
                          )}
                          {' / '}
                        </Text>
                        <Text as="span">
                          {formatValue(tokenLimits.dailyLimit, token.decimals)}{' '}
                          {token.symbol}
                        </Text>
                      </Text>
                    )}
                  </Box>
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
            </VStack>
          </PopoverBody>
        )}
      </PopoverContent>
    </Popover>
  );
};
