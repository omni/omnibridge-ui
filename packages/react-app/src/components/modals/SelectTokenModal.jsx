import { CustomTokenModal } from 'components/modals/CustomTokenModal';
import { TokenSelectorModal } from 'components/modals/TokenSelectorModal';
import { BridgeContext } from 'contexts/BridgeContext';
import React, { useContext, useEffect, useState } from 'react';

export const SelectTokenModal = ({ isOpen, onClose, isCustomTokenAbsent }) => {
  const { setIsCustomTokenAbsent } = useContext(BridgeContext);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    isCustomTokenAbsent && setCustom(true);
  }, [isCustomTokenAbsent]);

  const handleClose = () => {
    setIsCustomTokenAbsent(false);
    onClose();
  };

  return (
    <>
      {!custom && (
        <TokenSelectorModal
          isOpen={isOpen}
          onClose={handleClose}
          onCustom={() => setCustom(true)}
        />
      )}
      {custom && (
        <CustomTokenModal
          isOpen={isOpen}
          onClose={handleClose}
          onBack={() => setCustom(false)}
        />
      )}
    </>
  );
};
