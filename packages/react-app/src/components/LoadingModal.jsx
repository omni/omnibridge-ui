import { Flex, Image, Modal, ModalOverlay, Text } from '@chakra-ui/core';
import React, { useContext } from 'react';

import LoadingImage from '../assets/loading.svg';
import { BridgeContext } from '../contexts/BridgeContext';

export const LoadingModal = () => {
  const { loading } = useContext(BridgeContext);
  return (
    <Modal
      isOpen={loading}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
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
