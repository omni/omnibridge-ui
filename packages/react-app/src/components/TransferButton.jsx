import { Flex, Image, Text, useDisclosure } from '@chakra-ui/core';
import ethers from 'ethers';
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
  const onClick = () => {
    setMessage();
    if (
      ethersProvider &&
      !networkMismatch &&
      ethers.BigNumber.from(amount)
        .mul(10)
        .pow(token.decimals)
        .gte(
          ethers.BigNumber.from(parseFloat(token.minPerTx))
            .mul(10)
            .pow(token.decimals),
        ) &&
      ethers.BigNumber.from(amount)
        .mul(10)
        .pow(token.decimals)
        .lt(
          ethers.BigNumber.from(parseFloat(token.maxPerTx))
            .mul(10)
            .pow(token.decimals),
        ) &&
      ethers.BigNumber.from(token.balance).gte(ethers.BigNumber.from(amount))
    ) {
      return onOpen();
    }
    if (!ethersProvider) {
      setMessage('Please connect wallet');
    } else if (networkMismatch) {
      setMessage(`Please switch wallet to ${network.name}`);
    } else if (
      ethers.BigNumber.from(amount)
        .mul(10)
        .pow(token.decimals)
        .lt(
          ethers.BigNumber.from(parseFloat(token.minPerTx))
            .mul(10)
            .pow(token.decimals),
        )
    ) {
      setMessage(
        `Please specify amount more than ${formatValue(
          token.minPerTx,
          token.decimals,
        )}`,
      );
    } else if (
      ethers.BigNumber.from(amount)
        .mul(10)
        .pow(token.decimals)
        .gte(
          ethers.BigNumber.from(parseFloat(token.maxPerTx))
            .mul(10)
            .pow(token.decimals),
        )
    ) {
      setMessage(
        `Please specify amount less than ${formatValue(
          token.maxPerTx,
          token.decimals,
        )}`,
      );
    } else if (
      ethers.BigNumber.from(token.balance).lt(ethers.BigNumber.from(amount))
    ) {
      setMessage('Not enough balance');
    }
    return onOpen();
  };
  return (
    <Flex
      as="button"
      align="center"
      mt={{ base: 2, md: 2, lg: 3 }}
      color="blue.500"
      _hover={
        !allowed
          ? undefined
          : {
              color: 'blue.600',
            }
      }
      cursor={!allowed ? 'not-allowed' : 'pointer'}
      transition="0.25s"
      position="relative"
      opacity={!allowed ? 0.4 : 1}
      onClick={onClick}
      borderRadius="0.25rem"
      w={{ base: '13rem', lg: 'auto' }}
    >
      {isOpen && message && (
        <ErrorModal message={message} isOpen={isOpen} onClose={onClose} />
      )}
      {isOpen && !message && (
        <ConfirmTransferModal isOpen={isOpen} onClose={onClose} />
      )}
      <svg width="100%" viewBox="0 0 156 42" fill="none">
        <path
          d="M16.914 2.28A4 4 0 0120.526 0h114.948a4 4 0 013.612 2.28l16.19 34c1.264 2.655-.671 5.72-3.611 5.72H4.335C1.395 42-.54 38.935.724 36.28l16.19-34z"
          fill="currentColor"
        />
      </svg>
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
