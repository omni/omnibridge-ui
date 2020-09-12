import {
  Button,
  Flex,
  Image,
  Input,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/core';
import React, { useContext, useState } from 'react';

import DropDown from '../assets/drop-down.svg';
import EthLogo from '../assets/eth-logo.png';
import xDAILogo from '../assets/xdai-logo.png';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { formatValue, isxDaiChain, parseValue } from '../lib/helpers';
import { ErrorModal } from './ErrorModal';
import { SelectTokenModal } from './SelectTokenModal';

export const FromToken = () => {
  const { ethersProvider, network, networkMismatch } = useContext(Web3Context);
  const {
    fromToken: token,
    setAmount,
    amountInput: input,
    setAmountInput: setInput,
  } = useContext(BridgeContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState();
  const onClick = () => {
    if (!ethersProvider) {
      setMessage('Please connect wallet');
    } else if (networkMismatch) {
      setMessage(`Please switch wallet to ${network.name}`);
    } else {
      setMessage();
    }
    onOpen();
  };
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const fallbackLogo = isxDaiChain(network.value) ? xDAILogo : EthLogo;
  return (
    <Flex
      align="center"
      m={{ base: 2, lg: 0 }}
      mr={{ base: 2, lg: -6 }}
      position="relative"
      borderRadius="0.25rem"
      border={{ base: '1px solid #DAE3F0', lg: 'none' }}
      h={{ base: '6rem', lg: 'auto' }}
    >
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
          position="absolute"
          w="100%"
          h="100%"
          direction="column"
          py={4}
          pl={4}
          pr={{ base: 4, lg: 12 }}
        >
          <Flex justify="space-between" align="center" color="grey" mb={2}>
            <Text>{`Balance: ${formatValue(
              token.balance,
              token.decimals,
            )}`}</Text>
            <Text>{`\u2248 $${token.balanceInUsd}`}</Text>
          </Flex>
          <Flex align="center" flex={1}>
            <Flex align="center" cursor="pointer" onClick={onClick}>
              <Flex
                justify="center"
                align="center"
                background="white"
                border="1px solid #DAE3F0"
                boxSize={8}
                overflow="hidden"
                borderRadius="50%"
              >
                <Image
                  src={token.logoURI || fallbackLogo}
                  fallbackSrc={fallbackLogo}
                />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mx={2}>
                {token.name}
              </Text>
              <Image src={DropDown} cursor="pointer" />
            </Flex>
            {isOpen && message && (
              <ErrorModal message={message} isOpen={isOpen} onClose={onClose} />
            )}
            {isOpen && !message && (
              <SelectTokenModal onClose={onClose} isOpen={isOpen} />
            )}
            <Flex align="center" justify="flex-end" flex={1}>
              <Input
                variant="unstyled"
                type="number"
                value={input}
                textAlign="right"
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
                  setInput(formatValue(token.balance, token.decimals));
                  setAmount(token.balance);
                }}
              >
                Max
              </Button>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
