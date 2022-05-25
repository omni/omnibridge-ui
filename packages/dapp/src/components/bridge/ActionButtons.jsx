import { Flex, Tooltip } from '@chakra-ui/react';
import { TransferButton } from 'components/bridge/TransferButton';
import { UnlockButton } from 'components/bridge/UnlockButton';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useApproval } from 'hooks/useApproval';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const ActionButtons = ({ tokenLimits }) => {
  const { fromToken, fromAmount, txHash } = useBridgeContext();
  const approval = useApproval(fromToken, fromAmount, txHash);
  const { isConnected, providerChainId, isSanctioned } = useWeb3Context();

  const isValid =
    !isSanctioned && isConnected && providerChainId === fromToken?.chainId;

  const inner = (
    <Flex
      direction="column"
      px={{ base: 2, lg: 4 }}
      my={{ base: 2, lg: 0 }}
      align="center"
      w="100%"
      cursor={isValid ? 'default' : 'not-allowed'}
    >
      <UnlockButton {...{ approval, isValid }} />
      <TransferButton {...{ approval, isValid, tokenLimits }} />
    </Flex>
  );

  let tooltipTitle = '';

  if (!isValid) {
    if (isConnected) {
      if (isSanctioned) {
        tooltipTitle = 'Bridging is blocked';
      } else {
        tooltipTitle = `Please switch to ${getNetworkName(fromToken?.chainId)}`;
      }
    } else {
      tooltipTitle = 'Please connect your wallet';
    }
  }

  return isValid ? inner : <Tooltip label={tooltipTitle}>{inner}</Tooltip>;
};
