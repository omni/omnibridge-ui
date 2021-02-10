import {
  Button,
  Flex,
  Image,
  Input,
  Spinner,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';
import { defer } from 'rxjs';

import DropDown from '../assets/drop-down.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { formatValue, logError, parseValue } from '../lib/helpers';
import { fetchTokenBalance } from '../lib/token';
import { Logo } from './Logo';
import { SelectTokenModal } from './SelectTokenModal';

export const FromToken = () => {
  const { account, providerChainId: chainId } = useContext(Web3Context);
  const {
    updateBalance,
    fromToken: token,
    fromBalance: balance,
    setFromBalance: setBalance,
    setAmount,
    amountInput: input,
    setAmountInput: setInput,
  } = useContext(BridgeContext);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    let subscription;
    if (token && account && chainId === token.chainId) {
      setBalanceLoading(true);
      subscription = defer(() =>
        fetchTokenBalance(token, account).catch(fromBalanceError => {
          logError({ fromBalanceError });
          setBalance(BigNumber.from(0));
          setBalanceLoading(false);
        }),
      ).subscribe(b => {
        setBalance(b);
        setBalanceLoading(false);
      });
    } else {
      setBalance(BigNumber.from(0));
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [updateBalance, token, account, setBalance, setBalanceLoading, chainId]);

  return (
    <Flex
      align="center"
      m={{ base: 2, lg: 0 }}
      mr={{ base: 2, lg: -6 }}
      position="relative"
      borderRadius="0.25rem"
      border={{ base: '1px solid #DAE3F0', lg: 'none' }}
      minH={smallScreen ? '5rem' : 8}
      minW={smallScreen ? '15rem' : undefined}
    >
      <SelectTokenModal onClose={onClose} isOpen={isOpen} />
      {!smallScreen && (
        <svg width="100%" viewBox="0 0 381 94" fill="none">
          <path
            d="M359.745 4.703A7.5 7.5 0 00353.008.5H8A7.5 7.5 0 00.5 8v78A7.5 7.5 0 008 93.5h345.008a7.5 7.5 0 006.737-4.203l19.085-39a7.499 7.499 0 000-6.594l-19.085-39z"
            fill="#fff"
            stroke="#DAE3F0"
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
          pl={4}
          pr={{ base: 4, lg: 12 }}
        >
          <Flex
            justify="space-between"
            align={{ base: 'stretch', sm: 'center', lg: 'flex-start' }}
            mb={2}
            direction={{ base: 'column', sm: 'row' }}
          >
            <Flex
              align="center"
              cursor="pointer"
              onClick={onOpen}
              zIndex={1}
              background="white"
            >
              <Flex
                justify="center"
                align="center"
                background="white"
                border="1px solid #DAE3F0"
                boxSize={8}
                overflow="hidden"
                borderRadius="50%"
              >
                <Logo uri={token.logoURI} />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mx={2}>
                {token.name}
              </Text>
              <Image src={DropDown} cursor="pointer" />
            </Flex>
            <Flex
              flex={1}
              justify="flex-end"
              align="center"
              h="100%"
              position="relative"
              ml={{ base: undefined, sm: 2, md: undefined }}
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
                  {`Balance: ${formatValue(balance, token.decimals)}`}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex
            align="flex-end"
            flex={1}
            {...(!smallScreen
              ? {
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  pl: 4,
                  pr: 12,
                  pb: 4,
                }
              : {})}
          >
            <Input
              flex={1}
              variant="unstyled"
              type="number"
              value={input}
              placeholder="0.0"
              textAlign="left"
              fontWeight="bold"
              onChange={e => {
                setInput(e.target.value);
                setAmount(parseValue(e.target.value, token.decimals));
              }}
              fontSize="2xl"
            />
            <Button
              ml={2}
              color="blue.500"
              bg="blue.50"
              size="sm"
              fontSize="sm"
              fontWeight="normal"
              _hover={{ bg: 'blue.100' }}
              onClick={() => {
                setInput(utils.formatUnits(balance, token.decimals));
                setAmount(balance);
              }}
            >
              Max
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
