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
import React, { useContext } from 'react';

import ChangeNetworkImage from '../assets/change-network.png';
import ClaimTokenImage from '../assets/claim.svg';
import InfoImage from '../assets/info.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { getNetworkName, isxDaiChain } from '../lib/helpers';

export const ClaimTokensModal = ({setNeedsConfirmation}) => {
  const { fromToken, toToken } = useContext(
    BridgeContext,
  );
  const isxDai = fromToken !== undefined && isxDaiChain(fromToken.chainId);
  const toUnit =
    toToken !== undefined && toToken.symbol + (isxDai ? 'on Mainnet' : '');
  const onClose = () => {
    setNeedsConfirmation(false);
  };

  const onClick = () => {
    console.log('claimTokens();');
    onClose();
  };

  const networkChangeNeeded = isxDai;
  console.log({networkChangeNeeded});

  return (
    <Modal isOpen onClose={onClose} isCentered>
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
              src={networkChangeNeeded ? ChangeNetworkImage : ClaimTokenImage}
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
            <Flex align="center" direction="column">
              {networkChangeNeeded && (
                <Box w="100%" fontSize="sm" color="black">
                  <Text as="span">{`Please switch the network in your wallet to `}</Text>
                  <Text as="b">{`${getNetworkName(toToken.chainId)}`}</Text>
                </Box>
              )}
              <Flex
                mt={4}
                w="100%"
                borderRadius="4px"
                border="1px solid #DAE3F0"
                mb={networkChangeNeeded ? 6 : 0}
              >
                <Flex
                  bg="rgba(83, 164, 255, 0.1)"
                  borderLeftRadius="4px"
                  border="1px solid #53A4FF"
                  justify="center"
                  align="center"
                  minW="4rem"
                  flex={1}
                >
                  <Image src={InfoImage} />
                </Flex>
                <Flex align="center" fontSize="12px" p={4}>
                  <Text>
                    {networkChangeNeeded
                      ? `After you switch networks, you will complete a second transaction on ${getNetworkName(
                          toToken.chainId,
                        )} to claim your ${toUnit} tokens.`
                      : 'The claim process may take a variable period of time on ETH Mainnet depending on network congestion. Your DAI balance will increase to reflect the completed transfer after the claim is processed'}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
          {!networkChangeNeeded && (
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
                  Claim
                </Button>
              </Flex>
            </ModalFooter>
          )}
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
