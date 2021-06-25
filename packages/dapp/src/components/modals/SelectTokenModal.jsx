import { CustomTokenModal } from 'components/modals/CustomTokenModal';
import { TokenSelectorModal } from 'components/modals/TokenSelectorModal';
import React, { useState } from 'react';

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
          onClose={() => {
            setCustom(false);
            onClose();
          }}
          onBack={() => setCustom(false)}
        />
      )}
    </>
  );
};
