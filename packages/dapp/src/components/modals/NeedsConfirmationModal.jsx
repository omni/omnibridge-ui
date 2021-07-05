import {
  Alert,
  AlertIcon,
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
import ChangeNetworkImage from 'assets/change-network.png';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useRenderChain } from 'hooks/useRenderChain';
import { getNetworkName } from 'lib/helpers';
import React, { useState } from 'react';

export const NeedsConfirmationModal = ({
  setNeedsConfirmation,
  setMessage,
}) => {
  const { foreignChainId } = useBridgeDirection();
  const { fromToken, toToken, setTxHash } = useBridgeContext();
  const toUnit =
    (toToken !== undefined && toToken.symbol) ||
    (fromToken !== undefined && fromToken.symbol);

  const [isOpen, setOpen] = useState(true);
  const onClose = () => {
    setNeedsConfirmation(false);
    setTxHash();
    setMessage();
    setOpen(false);
  };

  const renderChain = useRenderChain();

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
                <Text as="span">
                  Please switch the network in your wallet to
                </Text>
                {renderChain(foreignChainId)}
              </Box>
              <Flex align="center" direction="column" w="100%" mt="4" mb="6">
                <Alert status="info" borderRadius={5}>
                  <AlertIcon minWidth="20px" />
                  <Text fontSize="small">
                    After you switch networks, you will complete a second
                    transaction on {getNetworkName(foreignChainId)} to claim
                    your {toUnit} tokens.
                  </Text>
                </Alert>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
