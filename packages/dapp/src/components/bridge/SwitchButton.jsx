import { IconButton, Tooltip } from '@chakra-ui/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useSwitchChain } from 'hooks/useSwitchChain';
import { SwitchIcon } from 'icons/SwitchIcon';
import React, { useCallback, useState } from 'react';

export const SwitchButton = () => {
  const { isConnected, providerChainId, isMetamask } = useWeb3Context();

  const { switchTokens, toToken } = useBridgeContext();
  const switchChain = useSwitchChain();

  const isDefaultChain = [1, 3, 4, 5, 42].includes(toToken?.chainId);
  const isMobileBrowser = navigator?.userAgent?.includes('Mobile') ?? false;
  const canSwitchInWallet =
    isConnected && isMetamask && (isMobileBrowser ? !isDefaultChain : true);

  const [loading, setLoading] = useState(false);

  const switchOnClick = useCallback(
    () =>
      (async () => {
        setLoading(true);
        if (canSwitchInWallet && providerChainId !== toToken?.chainId) {
          await switchChain(toToken?.chainId);
        } else {
          switchTokens();
        }
        setLoading(false);
      })(),
    [switchChain, providerChainId, canSwitchInWallet, switchTokens, toToken],
  );

  return (
    <Tooltip label="Switch direction of bridge">
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
        _hover={{ bg: '#EEF4FD' }}
        onClick={switchOnClick}
        isLoading={loading}
        _loading={{
          bg: '#EEF4FD',
        }}
      />
    </Tooltip>
  );
};
