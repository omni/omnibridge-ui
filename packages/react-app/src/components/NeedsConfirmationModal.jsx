import {
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useContext, useState } from 'react';

import ChangeNetworkImage from '../assets/change-network.png';
import InfoImage from '../assets/info.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { HOME_NETWORK } from '../lib/constants';
import { getBridgeNetwork, getNetworkName, isxDaiChain } from '../lib/helpers';

export const NeedsConfirmationModal = ({ setNeedsConfirmation }) => {
  const { fromToken, toToken, setTxHash } = useContext(BridgeContext);
  const isxDai = fromToken !== undefined && isxDaiChain(fromToken.chainId);
  const toUnit =
    toToken !== undefined && toToken.symbol + (isxDai ? ' on Mainnet' : '');

  const [isOpen, setOpen] = useState(true);
  const onClose = () => {
    setNeedsConfirmation(false);
    setTxHash();
    setOpen(false);
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
            <Image src={ChangeNetworkImage} w="100%" mt={4} />
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
              <Box w="100%" fontSize="sm" color="black">
                <Text as="span">{`Please switch the network in your wallet to `}</Text>
                <Text as="b">{`${getNetworkName(
                  getBridgeNetwork(HOME_NETWORK),
                )}`}</Text>
              </Box>
              <Flex
                mt={4}
                w="100%"
                borderRadius="4px"
                border="1px solid #DAE3F0"
                mb={6}
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
                    After you switch networks, you will complete a second
                    transaction on{' '}
                    {getNetworkName(getBridgeNetwork(HOME_NETWORK))} to claim
                    your {toUnit} tokens.
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
