import { Flex, Image, Link, Spinner, Text, useToast } from '@chakra-ui/react';
import UnlockIcon from 'assets/unlock.svg';
import { TxLink } from 'components/common/TxLink';
import { BridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import React, { useContext } from 'react';

export const UnlockButton = () => {
  const { providerChainId } = useWeb3Context();
  const {
    fromAmount: amount,
    fromBalance: balance,
    allowed,
    approve,
    unlockLoading,
    approvalTxHash,
  } = useContext(BridgeContext);
  const toast = useToast();
  const showError = msg => {
    if (msg) {
      toast({
        title: 'Error',
        description: msg,
        status: 'error',
        isClosable: 'true',
      });
    }
  };
  const valid = () => {
    if (amount.lte(0)) {
      showError('Please specify amount');
      return false;
    }
    if (balance.lt(amount)) {
      showError('Not enough balance');
      return false;
    }
    return true;
  };
  const onClick = () => {
    if (!unlockLoading && !allowed && valid()) {
      approve().catch(error => {
        if (error && error.message) {
          if (
            error.data &&
            (error.data.includes('Bad instruction fe') ||
              error.data.includes('Reverted'))
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
            showError(error.message);
          }
        } else {
          showError(
            'Impossible to perform the operation. Reload the application and try again.',
          );
        }
      });
    }
  };
  return (
    <Flex
      align="center"
      as="button"
      color="cyan.500"
      _hover={
        allowed
          ? undefined
          : {
              color: 'cyan.600',
            }
      }
      cursor={allowed ? 'not-allowed' : 'pointer'}
      transition="0.25s"
      position="relative"
      opacity={allowed ? 0.4 : 1}
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
              {allowed ? 'Unlocked' : 'Unlock'}
            </Text>
            <Image src={UnlockIcon} ml={2} />
          </>
        )}
      </Flex>
    </Flex>
  );
};
