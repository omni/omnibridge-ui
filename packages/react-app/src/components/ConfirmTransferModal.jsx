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
  useBreakpointValue,
} from '@chakra-ui/core';
import React, { useContext, useEffect, useState } from 'react';

import TransferImage from '../assets/confirm-transfer.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { formatValue, isxDaiChain } from '../lib/helpers';

export const ConfirmTransferModal = ({ isOpen, onClose }) => {
  const { fromToken, toToken, fromAmount, toAmount, transfer } = useContext(
    BridgeContext,
  );
  const [fee, setFee] = useState(0);
  useEffect(() => {
    setFee(
      ((Number(fromAmount) - Number(toAmount)) * 100) / Number(fromAmount),
    );
  }, [fromAmount, toAmount]);
  const isxDai = isxDaiChain(fromToken.chainId);
  const fromAmt = `${formatValue(fromAmount, fromToken.decimals)} ${
    fromToken.symbol
  }${isxDai ? ' on xDai' : ''}`;
  const toAmt = `${formatValue(toAmount, fromToken.decimals)} ${
    toToken.symbol
  }${isxDai ? '' : ' on xDai'}`;

  const onClick = () => {
    transfer();
    onClose();
  };
  const smallScreen = useBreakpointValue({ base: true, md: false });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="30rem"
          mx={{ base: 12, lg: 0 }}
        >
          <ModalHeader p={6}>
            <Text>Confirm Transfer</Text>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            // _focus={{ border: 'none', outline: 'none' }}
          />
          <ModalBody px={6} py={0}>
            <Flex
              align="center"
              fontWeight="bold"
              direction={{ base: 'column', md: 'row' }}
            >
              <Flex
                justify="center"
                align="center"
                border="1px solid #DAE3F0"
                borderRadius="0.25rem"
                w="10rem"
                h="4rem"
                px={4}
              >
                <Text textAlign="center">{fromAmt}</Text>
              </Flex>
              <Flex
                flex={1}
                minH="5rem"
                h="5rem"
                w={{ base: '10rem', md: 'auto' }}
                justify="center"
                align="center"
                position="relative"
              >
                <Divider
                  color="#DAE3F0"
                  orientation={smallScreen ? 'vertical' : 'horizontal'}
                />
                <Image
                  src={TransferImage}
                  position="absolute"
                  left="50%"
                  top="50%"
                  transform={{
                    base: 'translate(-50%, -50%) rotate(90deg)',
                    md: 'translate(-50%, -50%)',
                  }}
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
                <Text textAlign="center">{toAmt}</Text>
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
            <Flex
              w="100%"
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
            >
              <Button
                px={12}
                onClick={onClose}
                background="background"
                _hover={{ background: '#bfd3f2' }}
                color="#687D9D"
              >
                Cancel
              </Button>
              <Button
                px={12}
                onClick={onClick}
                colorScheme="blue"
                mt={{ base: 2, md: 0 }}
              >
                Continue
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
