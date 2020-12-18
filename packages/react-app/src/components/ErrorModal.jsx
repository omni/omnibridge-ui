import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

import { ErrorIcon } from '../icons/ErrorIcon';

export const ErrorModal = ({ message, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius={{ base: '1rem', md: 'full' }}
          mx={{ base: 12, lg: 0 }}
          maxW={{ base: '20rem', md: '25rem' }}
        >
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody p={4}>
            <Flex
              align={{ base: 'center', md: 'stretch' }}
              direction={{ base: 'column', md: 'row' }}
            >
              <ErrorIcon size={20} mr={4} color="red.500" />
              <Flex flex={1} direction="column">
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
