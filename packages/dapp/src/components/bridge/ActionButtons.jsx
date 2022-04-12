import { Flex } from '@chakra-ui/react';
import { TransferButton } from 'components/bridge/TransferButton';
import { UnlockButton } from 'components/bridge/UnlockButton';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useApproval } from 'hooks/useApproval';
import React from 'react';

export const ActionButtons = () => {
  const { fromToken, fromAmount, txHash } = useBridgeContext();
  const approval = useApproval(fromToken, fromAmount, txHash);
  return (
    <Flex
      direction="column"
      px={{ base: 2, lg: 4 }}
      my={{ base: 2, lg: 0 }}
      align="center"
      w="100%"
    >
      <UnlockButton {...{ approval }} />
      <TransferButton {...{ approval }} />
    </Flex>
  );
};
