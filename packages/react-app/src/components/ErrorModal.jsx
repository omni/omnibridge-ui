import {
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/core';
import React from 'react';

import ErrorImage from '../assets/error.svg';

export const ErrorModal = ({ message, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent boxShadow="0px 1rem 2rem #617492" borderRadius="full">
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            _focus={{ border: 'none', outline: 'none' }}
          />
          <ModalBody p={4}>
            <Flex align="center">
              <Flex
                height="5rem"
                width="5rem"
                align="center"
                justify="center"
                border="5px solid #f27474"
                borderRadius="50%"
                mr={4}
              >
                <Image src={ErrorImage} width="55%" height="55%" />
              </Flex>
              <Flex height="100%" flex={1} direction="column">
                <Text fontWeight="bold" fontSize="xl" width="100%">
                  Error
                </Text>
                <Text width="100%">{message || ''}</Text>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
