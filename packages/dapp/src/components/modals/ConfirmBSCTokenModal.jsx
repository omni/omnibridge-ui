import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { utils } from 'ethers';
import { getNetworkName } from 'lib/helpers';
import React, { useCallback, useState } from 'react';

const storageKey = token =>
  `${utils.hexlify(
    token.chainId,
  )}-${token.address.toLowerCase()}-confirm-eth-bsc`;

export const shouldShowBSCTokenModal = token =>
  window.localStorage.getItem(storageKey(token)) !== 'false';

const notShowBSCTokenModal = token =>
  window.localStorage.setItem(storageKey(token), 'false');

export const ConfirmBSCTokenModal = ({
  isOpen,
  onClose,
  onConfirm,
  token,
  bridgeChainId,
}) => {
  const [isChecked, setChecked] = useState(false);

  const onClick = useCallback(() => {
    if (isChecked) {
      notShowBSCTokenModal(token);
    }
    onClose();
    onConfirm();
  }, [isChecked, onClose, onConfirm, token]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="38rem"
          mx="4"
        >
          <ModalHeader p={6} mx={2}>
            <Text>
              Bridging {token?.name || token?.symbol || 'token'} to{' '}
              {getNetworkName(bridgeChainId)}
            </Text>
          </ModalHeader>
          <ModalBody px={8} py={0}>
            <Alert status="info" borderRadius={5} mb="2rem">
              <AlertIcon minWidth="2rem" />
              <Text fontSize="sm">
                Make sure that the bridged token is compatible with the token
                which already exists on the target chain.
              </Text>
            </Alert>
            <Checkbox
              w="100%"
              isChecked={isChecked}
              onChange={e => setChecked(e.target.checked)}
              borderColor="grey"
              borderRadius="4px"
              size="lg"
              variant="solid"
              mb="1rem"
            >
              <Text fontSize="sm">
                Don&apos;t display this window for this token again
              </Text>
            </Checkbox>
          </ModalBody>
          <ModalFooter>
            <Flex justify="center" align="center" w="100%">
              <Button
                onClick={onClick}
                isDisabled={!isChecked}
                colorScheme="blue"
                px="3rem"
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
