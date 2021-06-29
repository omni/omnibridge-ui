import { Flex, Image, Link, Spinner, Text, useToast } from '@chakra-ui/react';
import UnlockIcon from 'assets/unlock.svg';
import { TxLink } from 'components/common/TxLink';
import { isRebasingToken } from 'components/warnings/RebasingTokenWarning';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { isRevertedError } from 'lib/amb';
import { handleWalletError } from 'lib/helpers';
import React, { useCallback } from 'react';

export const UnlockButton = () => {
  const { providerChainId } = useWeb3Context();
  const {
    fromAmount: amount,
    fromBalance: balance,
    fromToken: token,
    toAmountLoading,
    allowed,
    approve,
    unlockLoading,
    approvalTxHash,
  } = useBridgeContext();
  const isRebaseToken = isRebasingToken(token);
  const buttonDisabled = allowed || isRebaseToken || toAmountLoading;
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
  const valid = useCallback(() => {
    if (amount.lte(0)) {
      showError('Please specify amount');
      return false;
    }
    if (balance.lt(amount)) {
      showError('Not enough balance');
      return false;
    }
    return true;
  }, [amount, balance, showError]);
  const onClick = useCallback(() => {
    if (!unlockLoading && !buttonDisabled && valid()) {
      approve().catch(error => {
        if (error && error.message) {
          if (
            isRevertedError(error) ||
            (error.data &&
              (error.data.includes('Bad instruction fe') ||
                error.data.includes('Reverted')))
          ) {
            showError(
              <Text>
                There is problem with the token unlock. Try to revoke previous
                approval if any on{' '}
                <Link
                  href="https://revoke.cash"
                  textDecor="underline"
                  isExternal
                >
                  https://revoke.cash/
                </Link>{' '}
                and try again.
              </Text>,
            );
          } else {
            handleWalletError(error, showError);
          }
        } else {
          showError(
            'Impossible to perform the operation. Reload the application and try again.',
          );
        }
      });
    }
  }, [unlockLoading, buttonDisabled, valid, showError, approve]);

  return (
    <Flex
      align="center"
      as="button"
      color="cyan.500"
      _hover={
        buttonDisabled
          ? undefined
          : {
              color: 'cyan.600',
            }
      }
      cursor={buttonDisabled ? 'not-allowed' : 'pointer'}
      transition="0.25s"
      position="relative"
      opacity={buttonDisabled ? 0.4 : 1}
      onClick={onClick}
      borderRadius="0.25rem"
      w={{ base: '10rem', sm: '12rem', lg: 'auto' }}
    >
      <svg width="100%" viewBox="0 0 156 42" fill="none">
        <path
          d="M139.086 39.72a4 4 0 01-3.612 2.28H20.526a4 4 0 01-3.612-2.28l-16.19-34C-.54 3.065 1.395 0 4.335 0h147.33c2.94 0 4.875 3.065 3.611 5.72l-16.19 34z"
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
        {unlockLoading ? (
          <TxLink chainId={providerChainId} hash={approvalTxHash}>
            <Spinner color="white" size="sm" />
          </TxLink>
        ) : (
          <>
            <Text color="white" fontWeight="bold">
              {buttonDisabled ? 'Unlocked' : 'Unlock'}
            </Text>
            <Image src={UnlockIcon} ml={2} />
          </>
        )}
      </Flex>
    </Flex>
  );
};
