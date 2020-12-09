import {
  Box,
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
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';

import TransferImage from '../assets/confirm-transfer.svg';
import AlertImage from '../assets/alert.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { formatValue, isxDaiChain } from '../lib/helpers';
import { DaiWarning, isERC20DaiAddress } from './DaiWarning';

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
  const fromAmt = formatValue(fromAmount, fromToken.decimals);
  const fromUnit = fromToken.symbol + (isxDai ? ' on xDai' : '');
  const toAmt = formatValue(toAmount, toToken.decimals);
  const toUnit = toToken.symbol + (isxDai ? '' : ' on xDai');
  const isERC20Dai = isERC20DaiAddress(fromToken);

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
          maxW="33.75rem"
          mx={{ base: 12, lg: 0 }}
        >
          <ModalHeader p={6}>
            {isERC20Dai && <DaiWarning />}
            <Text>Confirm Transfer</Text>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody px={6} py={0}>
            <Flex align="center" direction={{ base: 'column', md: 'row' }}>
              <Flex
                justify="center"
                align="center"
                direction="column"
                border="1px solid #DAE3F0"
                borderRadius="0.25rem"
                w="10rem"
                h="4rem"
                px={4}
              >
                <Text textAlign="center" fontWeight="bold">
                  {fromAmt}
                </Text>
                <Text textAlign="center" fontSize="sm">
                  {fromUnit}
                </Text>
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
                direction="column"
                border="1px solid #DAE3F0"
                borderRadius="0.25rem"
                w="10rem"
                h="4rem"
                px={4}
              >
                <Text textAlign="center" fontWeight="bold">
                  {toAmt}
                </Text>
                <Text textAlign="center" fontSize="sm">
                  {toUnit}
                </Text>
              </Flex>
            </Flex>
            <Flex align="center" fontSize="sm" justify="center" mt={4}>
              {`Bridge Fees ${Number(fee.toFixed(3))}%`}
            </Flex>
            <Divider color="#DAE3F0" my={4} />
            <Box w="100%" fontSize="sm" color={isxDai ? 'black' : 'grey'}>
              <Text as="span">{`Please confirm that you would like to send `}</Text>
              <Text as="b">{`${fromAmt} ${fromUnit}`}</Text>
              <Text as="span">{` and receive `}</Text>
              <Text as="b">{`${toAmt} ${toUnit}`}</Text>
            </Box>
            {isxDai && (
              <Flex
                mt={4}
                w="100%"
                borderRadius="4px"
                border="1px solid #DAE3F0"
              >
                <Flex
                  bg="#FFF7EF"
                  borderLeftRadius="4px"
                  border="1px solid #FFAA5C"
                  justify="center"
                  align="center"
                  minW="4rem"
                  flex={1}
                >
                  <Image src={AlertImage} />
                </Flex>
                <Flex align="center" fontSize="12px" p={4}>
                  <Text>
                    The claim process requires 2 transactions, one on xDai chain
                    and one on ETH Mainnet. You will need some xDai and some ETH
                    to complete.
                  </Text>
                </Flex>
              </Flex>
            )}
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
