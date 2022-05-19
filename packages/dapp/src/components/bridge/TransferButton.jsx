import { Flex, Image, Text, useDisclosure, useToast } from '@chakra-ui/react';
import { captureMessage } from '@sentry/react';
import TransferIcon from 'assets/transfer.svg';
import { ConfirmTransferModal } from 'components/modals/ConfirmTransferModal';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { utils } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useNeedsClaiming } from 'hooks/useNeedsClaiming';
import { useTokenDisabled } from 'hooks/useTokenDisabled';
import { formatValue, getNetworkName } from 'lib/helpers';
import React, { useCallback } from 'react';

export const TransferButton = ({ approval, isValid, tokenLimits }) => {
  const { isGnosisSafe, providerChainId, account } = useWeb3Context();
  const { bridgeDirection } = useBridgeDirection();
  const {
    receiver,
    fromAmount: amount,
    fromToken: token,
    fromBalance: balance,
    toAmountLoading,
  } = useBridgeContext();

  const { allowed } = approval;
  const needsClaiming = useNeedsClaiming();
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
  const isBridgingDisabled = useTokenDisabled(token);
  const buttonEnabled =
    !!token && allowed && !toAmountLoading && !isBridgingDisabled && isValid;

  const valid = useCallback(() => {
    if (!providerChainId) {
      showError('Please connect wallet');
    } else if (providerChainId !== token?.chainId) {
      showError(`Please switch to ${getNetworkName(token?.chainId)}`);
    } else if (
      tokenLimits &&
      (amount.gt(tokenLimits.remainingLimit) ||
        tokenLimits.remainingLimit.lt(tokenLimits.minPerTx))
    ) {
      showError(
        'Daily limit reached. Please try again tomorrow or with a lower amount',
      );
      captureMessage(
        `Daily limit reached - ${bridgeDirection.toUpperCase()} - 0x${token.chainId.toString(
          16,
        )} - ${token.symbol} - ${token.address}`,
        {
          tags: {
            debugMode: process.env.REACT_APP_DEBUG_LOGS === 'true',
            bridgeDirection,
            userAddress: account,
            receiverAddress: receiver || account,
            isGnosisSafe: isGnosisSafe ?? false,
            tokenAddress: token.address,
            tokenChainId: token.chainId,
            tokenSymbol: token.symbol,
            tokenAmount: amount.toString(),
            userBalance: balance.toString(),
            ...Object.fromEntries(
              Object.entries(tokenLimits).map(([key, value]) => [
                key,
                value.toString(),
              ]),
            ),
          },
        },
      );
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
    providerChainId,
    tokenLimits,
    token,
    amount,
    balance,
    receiver,
    isGnosisSafe,
    account,
    showError,
    bridgeDirection,
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
