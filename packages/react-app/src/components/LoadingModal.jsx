import { Flex, Image, Modal, ModalOverlay, Text } from '@chakra-ui/core';
import React from 'react';

import LoadingImage from '../assets/loading.svg';

export const LoadingModal = () => {
  return (
    <Modal isOpen closeOnEsc={false} closeOnOverlayClick={false} isCentered>
      <ModalOverlay background="modalBG">
        <Flex direction="column" align="center">
          <Image src={LoadingImage} mb={4} />
          <Text color="white" fontWeight="bold">
            Loading ...
          </Text>
        </Flex>
      </ModalOverlay>
    </Modal>
  );
};
