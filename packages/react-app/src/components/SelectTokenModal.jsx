import { Modal, ModalOverlay } from '@chakra-ui/core';
import React, { useState } from 'react';

import { CustomTokenModal } from './CustomTokenModal';
import { TokenSelectorModal } from './TokenSelectorModal';

export const SelectTokenModal = ({ isOpen, onClose }) => {
  const [custom, setCustom] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" isCentered>
      <ModalOverlay background="modalBG">
        {!custom && (
          <TokenSelectorModal
            onClose={onClose}
            onCustom={() => setCustom(true)}
          />
        )}
        {custom && (
          <CustomTokenModal onClose={onClose} onBack={() => setCustom(false)} />
        )}
      </ModalOverlay>
    </Modal>
  );
};
