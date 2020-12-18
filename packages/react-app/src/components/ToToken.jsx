import { Flex, Spinner, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { formatValue } from '../lib/helpers';
import { fetchTokenBalance } from '../lib/token';
import { Logo } from './Logo';

export const ToToken = () => {
  const { account } = useContext(Web3Context);
  const {
    receipt,
    toToken: token,
    toAmount: amount,
    toAmountLoading: loading,
    toBalance: balance,
    setToBalance: setBalance,
  } = useContext(BridgeContext);

  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (token && account) {
      setBalanceLoading(true);
      fetchTokenBalance(token, account).then(b => {
        setBalance(b);
        setBalanceLoading(false);
      });
    } else {
      setBalance();
    }
  }, [receipt, token, account, setBalance, setBalanceLoading]);

  return (
    <Flex
      align="center"
      m={{ base: 2, lg: 0 }}
      ml={{ base: 2, lg: -6 }}
      position="relative"
      borderRadius="0.25rem"
      background={{ base: '#EEF4FD', lg: 'transparent' }}
      minH={8}
    >
      {!smallScreen && (
        <svg width="100%" viewBox="0 0 381 94" fill="none">
          <path
            d="M20.806 4.484A8 8 0 0127.992 0H373a8 8 0 018 8v78a8 8 0 01-8 8H27.992a8 8 0 01-7.186-4.484l-19.085-39a8 8 0 010-7.032l19.085-39z"
            fill="#EEF4FD"
          />
        </svg>
      )}
      {token && (
        <Flex
          position={{ base: 'relative', lg: 'absolute' }}
          h={{ base: 'auto', lg: '100%' }}
          w="100%"
          direction="column"
          py={4}
          pr={4}
          pl={{ base: 4, lg: 12 }}
        >
          <Flex
            justify="space-between"
            align={{ base: 'stretch', sm: 'flex-start' }}
            mb={2}
            direction={{ base: 'column', sm: 'row' }}
          >
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
                <Logo uri={token.logoURI} reverseFallback />
              </Flex>
              <Text fontSize="lg" fontWeight="bold">
                {token.name}
              </Text>
            </Flex>
            <Flex
              flex={1}
              justify="flex-end"
              align="center"
              h="100%"
              position="relative"
            >
              {balanceLoading ? (
                <Spinner size="sm" color="grey" />
              ) : (
                <Text
                  color="grey"
                  textAlign="right"
                  {...(smallScreen
                    ? {}
                    : { position: 'absolute', bottom: '4px', right: 0 })}
                >
                  {`Balance: ${formatValue(balance || 0, token.decimals)}`}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex
            justify="center"
            direction="column"
            flex={1}
            {...(!smallScreen
              ? {
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  pl: 12,
                  pr: 4,
                  pb: 4,
                }
              : {})}
            h="52px"
          >
            {loading ? (
              <Spinner color="black" size="sm" />
            ) : (
              <Text fontWeight="bold" fontSize="2xl">
                {formatValue(amount, token.decimals)}
              </Text>
            )}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
