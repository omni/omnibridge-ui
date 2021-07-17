import { Flex, Image, Text, useDisclosure, useToast } from '@chakra-ui/react';
import TransferIcon from 'assets/transfer.svg';
import { ConfirmTransferModal } from 'components/modals/ConfirmTransferModal';
import { isRebasingToken } from 'components/warnings/RebasingTokenWarning';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { utils } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { ADDRESS_ZERO } from 'lib/constants';
import { formatValue } from 'lib/helpers';
import React, { useCallback } from 'react';

export const TransferButton = () => {
  const { foreignChainId, enableReversedBridge } = useBridgeDirection();
  const { isGnosisSafe, ethersProvider } = useWeb3Context();
  const {
    receiver,
    fromAmount: amount,
    fromToken: token,
    toToken,
    fromBalance: balance,
    tokenLimits,
    allowed,
    toAmountLoading,
    needsClaiming,
  } = useBridgeContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const showError = useCallback(
    msg => {
      if (msg) {
        toast({
          title: 'Error',
          description: msg,
          status: 'error',
          isClosable: 'true',
        });
      }
    },
    [toast],
  );
  const isRebaseToken = isRebasingToken(token);
  const showReverseBridgeWarning =
    !!toToken &&
    !enableReversedBridge &&
    toToken.chainId === foreignChainId &&
    toToken.address === ADDRESS_ZERO;
  const buttonEnabled =
    allowed && !isRebaseToken && !showReverseBridgeWarning && !toAmountLoading;

  const valid = useCallback(() => {
    if (!ethersProvider) {
      showError('Please connect wallet');
    } else if (tokenLimits && amount.lt(tokenLimits.minPerTx)) {
      showError(
        `Please specify amount more than ${formatValue(
          tokenLimits.minPerTx,
          token.decimals,
        )}`,
      );
    } else if (tokenLimits && amount.gt(tokenLimits.maxPerTx)) {
      showError(
        `Please specify amount less than ${formatValue(
          tokenLimits.maxPerTx,
          token.decimals,
        )}`,
      );
    } else if (balance.lt(amount)) {
      showError('Not enough balance');
    } else if (receiver ? !utils.isAddress(receiver) : isGnosisSafe) {
      showError(`Please specify a valid recipient address`);
    } else {
      return true;
    }
    return false;
  }, [
    ethersProvider,
    tokenLimits,
    token,
    amount,
    balance,
    receiver,
    isGnosisSafe,
    showError,
  ]);

  const onClick = () => {
    if (buttonEnabled && valid()) {
      onOpen();
    }
  };

  return (
    <Flex
      as="button"
      align="center"
      mt={{ base: 2, md: 2, lg: 3 }}
      color={needsClaiming ? 'purple.300' : 'blue.500'}
      _hover={
        !buttonEnabled
          ? undefined
          : {
              color: needsClaiming ? 'purple.400' : 'blue.600',
            }
      }
      cursor={!buttonEnabled ? 'not-allowed' : 'pointer'}
      transition="0.25s"
      position="relative"
      opacity={!buttonEnabled ? 0.4 : 1}
      onClick={onClick}
      borderRadius="0.25rem"
      w={{ base: '10rem', sm: '12rem', lg: 'auto' }}
    >
      <ConfirmTransferModal isOpen={isOpen} onClose={onClose} />
      <svg width="100%" viewBox="0 0 156 42" fill="none">
        <path
          d="M16.914 2.28A4 4 0 0120.526 0h114.948a4 4 0 013.612 2.28l16.19 34c1.264 2.655-.671 5.72-3.611 5.72H4.335C1.395 42-.54 38.935.724 36.28l16.19-34z"
          fill="currentColor"
        />
      </svg>
      <Flex
        position="absolute"
        w="100%"
        h="100%"
        justify="center"
        align="center"
      >
        <Text color="white" fontWeight="bold">
          {needsClaiming ? 'Request' : 'Transfer'}
        </Text>
        <Image src={TransferIcon} ml={2} />
      </Flex>
    </Flex>
  );
};
