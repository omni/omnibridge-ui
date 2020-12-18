import {
  Box,
  Button,
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
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ClaimTokenImage from '../assets/claim.svg';
import ErrorImage from '../assets/error.svg';
import InfoImage from '../assets/info.svg';
import ClaimTokensImage from '../assets/multiple-claim.svg';
import { CONFIG } from '../config';
import { Web3Context } from '../contexts/Web3Context';
import { executeSignatures } from '../lib/amb';
import { getBridgeNetwork, getNetworkName, isxDaiChain } from '../lib/helpers';
import { useXDaiTransfers } from '../lib/history';

export const ClaimTokensModal = () => {
  const { transfers } = useXDaiTransfers();
  const { ethersProvider, providerChainId } = useContext(Web3Context);
  const [claiming, setClaiming] = useState(false);
  const [needsClaim, setNeedsClaim] = useState([]);
  const [isOpen, setOpen] = useState(false);
  const [transfer, setTransfer] = useState();
  const isxDai = isxDaiChain(providerChainId);
  const { message, symbol, receivingTx } = transfer || {};

  const onClose = () => {
    setTransfer();
    setOpen(false);
  };

  useEffect(() => {
    const claimTokens = parseInt(
      window.sessionStorage.getItem('claimTokens'),
      10,
    );
    if (transfers) {
      const filteredTransfers = transfers.filter(t => !t.receivingTx);
      setNeedsClaim(filteredTransfers);
      if (!transfer && filteredTransfers.length === 1) {
        setTransfer(filteredTransfers[0]);
      } else if (transfer) {
        setTransfer(transfers.find(t => t.sendingTx === transfer.sendingTx));
      }
      if (
        !isxDai &&
        (isNaN(claimTokens) || claimTokens < filteredTransfers.length)
      ) {
        setOpen(filteredTransfers.length > 0);
        window.sessionStorage.setItem('claimTokens', filteredTransfers.length);
      }
    }
  }, [transfers, transfer, isxDai]);

  const executed = !!receivingTx;
  const claimable =
    !isxDai &&
    !claiming &&
    message &&
    message.msgData &&
    message.signatures &&
    !executed;

  const claimTokens = async () => {
    if (!claimable) return;
    setClaiming(true);
    try {
      await executeSignatures(ethersProvider, providerChainId, message);
    } catch (executeError) {
      // eslint-disable-next-line no-console
      console.log({ executeError });
    }
    setClaiming(false);
    onClose();
  };

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
            <Text>Claim Your Tokens</Text>
            <Image
              src={message ? ClaimTokenImage : ClaimTokensImage}
              w="100%"
              mt={4}
            />
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody px={6} py={0}>
            {message ? (
              <Flex align="center" direction="column">
                <Flex
                  mt={4}
                  w="100%"
                  borderRadius="4px"
                  border="1px solid #DAE3F0"
                  mb={executed ? 6 : 0}
                >
                  <Flex
                    bg="rgba(83, 164, 255, 0.1)"
                    borderLeftRadius="4px"
                    border="1px solid #53A4FF"
                    justify="center"
                    align="center"
                    minW="4rem"
                    maxW="4rem"
                    flex={1}
                  >
                    <Image src={InfoImage} />
                  </Flex>
                  <Flex align="center" fontSize="12px" p={4}>
                    <Text>
                      The claim process may take a variable period of time on{' '}
                      {getNetworkName(getBridgeNetwork(CONFIG.network))}{' '}
                      depending on network congestion. Your {symbol} balance
                      will increase to reflect the completed transfer after the
                      claim is processed
                    </Text>
                  </Flex>
                </Flex>
                {executed && (
                  <Flex w="100%" borderRadius="4px" border="1px solid #DAE3F0">
                    <Flex
                      bg="rgba(255, 102, 92, 0.1)"
                      borderLeftRadius="4px"
                      border="1px solid #FF665C"
                      justify="center"
                      align="center"
                      minW="4rem"
                      maxW="4rem"
                      flex={1}
                    >
                      <Image src={ErrorImage} />
                    </Flex>
                    <Flex align="center" fontSize="12px" p={4}>
                      <Text>The withdrawal request was already executed</Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            ) : (
              <Flex align="center" direction="column">
                <Box w="100%">
                  <Text as="span">{`You have `}</Text>
                  <Text as="b">{needsClaim.length}</Text>
                  <Text as="span">{` not claimed transactions `}</Text>
                </Box>
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
              {message ? (
                <Button
                  px={12}
                  onClick={claimTokens}
                  colorScheme="blue"
                  mt={{ base: 2, md: 0 }}
                  isDisabled={!claimable}
                  isLoading={claiming}
                >
                  Claim
                </Button>
              ) : (
                <Link to="/history" display="flex">
                  <Button
                    px={12}
                    colorScheme="blue"
                    mt={{ base: 2, md: 0 }}
                    w="100%"
                  >
                    Claim
                  </Button>
                </Link>
              )}
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
