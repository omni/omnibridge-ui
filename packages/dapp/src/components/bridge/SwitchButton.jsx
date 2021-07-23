import { IconButton, Tooltip } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useSwitchChain } from 'hooks/useSwitchChain';
import { SwitchIcon } from 'icons/SwitchIcon';
import React, { useCallback, useMemo } from 'react';

export const SwitchButton = () => {
  const { providerChainId, isMetamask } = useWeb3Context();
  const { getBridgeChainId } = useBridgeDirection();
  const bridgeChainId = useMemo(
    () => getBridgeChainId(providerChainId),
    [providerChainId, getBridgeChainId],
  );
  const switchChain = useSwitchChain();
  const switchOnClick = useCallback(
    () => switchChain(bridgeChainId),
    [switchChain, bridgeChainId],
  );

  const isDefaultChain = [1, 3, 4, 5, 42].includes(bridgeChainId);
  const isMobileBrowser = navigator?.userAgent?.includes('Mobile') || false;
  const buttonWillWork =
    isMetamask && (isMobileBrowser ? !isDefaultChain : true);

  return buttonWillWork ? (
    <Tooltip label="Switch direction of bridge" closeOnClick={false}>
      <IconButton
        icon={<SwitchIcon boxSize="2rem" />}
        p="0.5rem"
        variant="ghost"
        position="absolute"
        top={{ base: '50%', lg: '0' }}
        left={{ base: '0', lg: '50%' }}
        transform={{
          base: 'translateY(-50%) translateX(0.5rem) rotate(90deg)',
          lg: 'translateX(-50%) translateY(calc(-100% - 1.25rem))',
        }}
        borderRadius="0.5rem"
        color="blue.500"
        _hover={{ bg: 'blackAlpha.100' }}
        onClick={switchOnClick}
      />
    </Tooltip>
  ) : null;
};
