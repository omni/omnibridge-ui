import {
  Flex,
  Image,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/core';
import React, { useContext, useState } from 'react';

import TransferIcon from '../assets/transfer.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { formatValue } from '../lib/helpers';
import { ConfirmTransferModal } from './ConfirmTransferModal';
import { ErrorModal } from './ErrorModal';

export const TransferButton = () => {
  const { network, networkMismatch, ethersProvider } = useContext(Web3Context);
  const { fromAmount: amount, allowed, fromToken: token } = useContext(
    BridgeContext,
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [message, setMessage] = useState();
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const onClick = () => {
    setMessage();
    if (
      ethersProvider &&
      !networkMismatch &&
      window.BigInt(amount) >= window.BigInt(token.minPerTx) &&
      window.BigInt(amount) < window.BigInt(token.maxPerTx) &&
      window.BigInt(token.balance) >= window.BigInt(amount)
    ) {
      return onOpen();
    }
    if (!ethersProvider) {
      setMessage('Please connect wallet');
    } else if (networkMismatch) {
      setMessage(`Please switch wallet to ${network.name}`);
    } else if (window.BigInt(amount) < window.BigInt(token.minPerTx)) {
      setMessage(
        `Please specify amount more than ${formatValue(
          token.minPerTx,
          token.decimals,
        )}`,
      );
    } else if (window.BigInt(amount) >= window.BigInt(token.maxPerTx)) {
      setMessage(
        `Please specify amount less than ${formatValue(
          token.maxPerTx,
          token.decimals,
        )}`,
      );
    } else if (window.BigInt(token.balance) < window.BigInt(amount)) {
      setMessage('Not enough balance');
    }
    return onOpen();
  };
  return (
    <Flex
      align="center"
      mt={{ base: 2, md: 2, lg: 3 }}
      color="blue.500"
      _hover={
        !allowed
          ? undefined
          : {
              color: 'blue.600',
              background: smallScreen ? 'blue.600' : 'transparent',
            }
      }
      cursor={!allowed ? 'not-allowed' : 'pointer'}
      transition="0.25s"
      position="relative"
      opacity={!allowed ? 0.4 : 1}
      onClick={onClick}
      borderRadius="0.25rem"
      background={{ base: 'blue.500', lg: 'transparent' }}
      h={{ base: '3rem', lg: 'auto' }}
      w={{ base: '10rem', md: '15rem', lg: 'auto' }}
    >
      {isOpen && message && (
        <ErrorModal message={message} isOpen={isOpen} onClose={onClose} />
      )}
      {isOpen && !message && (
        <ConfirmTransferModal isOpen={isOpen} onClose={onClose} />
      )}
      {!smallScreen && (
        <svg width="100%" viewBox="0 0 156 42" fill="none">
          <path
            d="M16.914 2.28A4 4 0 0120.526 0h114.948a4 4 0 013.612 2.28l16.19 34c1.264 2.655-.671 5.72-3.611 5.72H4.335C1.395 42-.54 38.935.724 36.28l16.19-34z"
            fill="currentColor"
          />
        </svg>
      )}
      <Flex
        position="absolute"
        w="100%"
        h="100%"
        justify="center"
        align="center"
      >
        <Text color="white" fontWeight="bold">
          Transfer
        </Text>
        <Image src={TransferIcon} ml={2} />
      </Flex>
    </Flex>
  );
};
