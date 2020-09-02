import {
  Button,
  Divider,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/core';
import { utils } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';

import TransferImage from '../assets/confirm-transfer.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { isxDaiChain } from '../lib/helpers';

export const ConfirmTransferModal = ({ isOpen, onClose }) => {
  const { fromToken, toToken, fromAmount, toAmount, transfer } = useContext(
    BridgeContext,
  );
  const [fee, setFee] = useState(0);
  useEffect(() => {
    setFee(((fromAmount - toAmount) * 100) / fromAmount);
  }, [fromAmount, toAmount]);
  const isxDai = isxDaiChain(fromToken.chainId);
  const fromAmt = `${utils.formatEther(fromAmount)} ${fromToken.symbol}${
    isxDai ? ' on xDai' : ''
  }`;
  const toAmt = `${utils.formatEther(toAmount)} ${toToken.symbol}${
    isxDai ? '' : ' on xDai'
  }`;

  const onClick = () => {
    transfer();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="30rem"
        >
          <ModalHeader p={6}>
            <Text>Confirm Transfer</Text>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            _focus={{ border: 'none', outline: 'none' }}
          />
          <ModalBody px={6} py={0}>
            <Flex align="center" fontWeight="bold">
              <Flex
                justify="center"
                align="center"
                border="1px solid #DAE3F0"
                borderRadius="0.25rem"
                w="10rem"
                h="4rem"
                px={4}
              >
                <Text>{fromAmt}</Text>
              </Flex>
              <Flex
                flex={1}
                justify="center"
                align="center"
                position="relative"
              >
                <Divider color="#DAE3F0" />
                <Image
                  src={TransferImage}
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform="translate(-50%, -50%)"
                />
              </Flex>
              <Flex
                justify="center"
                align="center"
                border="1px solid #DAE3F0"
                borderRadius="0.25rem"
                w="10rem"
                h="4rem"
                px={4}
              >
                <Text>{toAmt}</Text>
              </Flex>
            </Flex>
            <Flex align="center" fontSize="sm" justify="center" mt={4}>
              {`Bridge Fees ${fee}%`}
            </Flex>
            <Divider color="#DAE3F0" my={4} />
            <Flex w="100%" fontSize="sm" color="grey" align="center">
              {`Please confirm that you would like to send ${fromAmt} and receive ${toAmt}.`}
            </Flex>
          </ModalBody>
          <ModalFooter p={6}>
            <Flex w="100%" justify="space-between" align="center">
              <Button
                px={12}
                onClick={onClose}
                background="background"
                _hover={{ background: '#bfd3f2' }}
                color="#687D9D"
              >
                Cancel
              </Button>
              <Button px={12} onClick={onClick} colorScheme="blue">
                Continue
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
