import { CustomTokenModal } from 'components/modals/CustomTokenModal';
import { TokenListModal } from 'components/modals/TokenListModal';
import React, { useState } from 'react';

export const SelectTokenModal = ({ isOpen, onClose }) => {
  const [custom, setCustom] = useState(false);

  return (
    <>
      <TokenListModal
        isOpen={custom ? false : isOpen}
        onClose={onClose}
        onCustom={() => setCustom(true)}
      />
      <CustomTokenModal
        isOpen={custom ? isOpen : false}
        onClose={() => {
          setCustom(false);
          onClose();
        }}
        onBack={() => setCustom(false)}
      />
    </>
  );
};
