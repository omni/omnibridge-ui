import React, { useState } from 'react';

import { CustomTokenModal } from './CustomTokenModal';
import { TokenSelectorModal } from './TokenSelectorModal';

export const SelectTokenModal = ({ isOpen, onClose }) => {
  const [custom, setCustom] = useState(false);
  return (
    <>
      {!custom && (
        <TokenSelectorModal
          isOpen={isOpen}
          onClose={onClose}
          onCustom={() => setCustom(true)}
        />
      )}
      {custom && (
        <CustomTokenModal
          isOpen={isOpen}
          onClose={onClose}
          onBack={() => setCustom(false)}
        />
      )}
    </>
  );
};
