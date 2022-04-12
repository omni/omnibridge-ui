import { useToast } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { executeSignatures, TOKENS_CLAIMED } from 'lib/amb';
import {
  getNetworkName,
  handleWalletError,
  logDebug,
  logError,
} from 'lib/helpers';
import { getMessage, messageCallStatus } from 'lib/message';
import { addChainToMetaMask } from 'lib/metamask';
import { getEthersProvider } from 'lib/providers';
import { useCallback, useEffect, useState } from 'react';

const useExecution = () => {
  const { foreignChainId, foreignAmbAddress, foreignAmbVersion } =
    useBridgeDirection();
  const { providerChainId, ethersProvider, isMetamask } = useWeb3Context();
  const [doRepeat, setDoRepeat] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [message, setMessage] = useState();
  const [txHash, setTxHash] = useState();

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

  const switchChain = useCallback(
    async chainId => {
      const result = await addChainToMetaMask(chainId).catch(metamaskError => {
        logError({ metamaskError });
        handleWalletError(metamaskError, showError);
      });
      return result;
    },
    [showError],
  );

  const isRightNetwork = providerChainId === foreignChainId;

  const executeCallback = useCallback(
    async msgData => {
      try {
        setExecuting(true);
        if (!isRightNetwork) {
          if (isMetamask) {
            const success = await switchChain(foreignChainId);
            if (success) {
              setMessage(msgData);
              setDoRepeat(true);
              return;
            }
          }
          showError(
            `Wrong network. Please connect your wallet to ${getNetworkName(
              foreignChainId,
            )}.`,
          );
        } else {
          const tx = await executeSignatures(
            ethersProvider,
            foreignAmbAddress,
            foreignAmbVersion,
            msgData,
          );
          await tx.wait();
          setTxHash(tx.hash);
        }
      } catch (claimError) {
        if (claimError?.code === 'TRANSACTION_REPLACED') {
          if (claimError.cancelled) {
            throw new Error('transaction was replaced');
          } else {
            logDebug('TRANSACTION_REPLACED');
            await claimError.replacement.wait();
            setTxHash(claimError.replacement.hash);
          }
        } else {
          throw claimError;
        }
      } finally {
        setExecuting(false);
      }
    },
    [
      ethersProvider,
      isMetamask,
      foreignChainId,
      foreignAmbVersion,
      foreignAmbAddress,
      showError,
      switchChain,
      isRightNetwork,
    ],
  );

  useEffect(() => {
    if (isRightNetwork && doRepeat && !!message) {
      executeCallback(message);
      setDoRepeat(false);
      setMessage();
    }
  }, [executeCallback, doRepeat, message, isRightNetwork]);

  return { executeCallback, executing, executionTx: txHash };
};

export const useClaim = () => {
  const {
    homeChainId,
    homeAmbAddress,
    foreignChainId,
    foreignAmbAddress,
    homeRequiredSignatures,
  } = useBridgeDirection();
  const { providerChainId, isMetamask } = useWeb3Context();
  const { executeCallback, executing, executionTx } = useExecution();

  const claim = useCallback(
    async (txHash, txMessage) => {
      if (providerChainId !== foreignChainId && !isMetamask) {
        throw Error(
          `Wrong network. Please connect your wallet to ${getNetworkName(
            foreignChainId,
          )}.`,
        );
      }
      let message =
        txMessage &&
        txMessage.signatures &&
        txMessage.signatures.length >= homeRequiredSignatures
          ? txMessage
          : null;
      if (!message) {
        const homeProvider = await getEthersProvider(homeChainId);
        message = await getMessage(true, homeProvider, homeAmbAddress, txHash);
      }
      const foreignProvider = await getEthersProvider(foreignChainId);
      const claimed = await messageCallStatus(
        foreignAmbAddress,
        foreignProvider,
        message.messageId,
      );
      if (claimed) {
        throw Error(TOKENS_CLAIMED);
      }
      return executeCallback(message);
    },
    [
      executeCallback,
      homeChainId,
      homeAmbAddress,
      foreignChainId,
      foreignAmbAddress,
      providerChainId,
      isMetamask,
      homeRequiredSignatures,
    ],
  );

  return { claim, executing, executionTx };
};
