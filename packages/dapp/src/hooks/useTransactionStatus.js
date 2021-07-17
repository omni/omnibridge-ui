import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { POLLING_INTERVAL } from 'lib/constants';
import { logError } from 'lib/helpers';
import {
  getMessage,
  getMessageData,
  messageCallStatus,
  NOT_ENOUGH_COLLECTED_SIGNATURES,
} from 'lib/message';
import { getEthersProvider } from 'lib/providers';
import { useCallback, useEffect, useState } from 'react';

export const useTransactionStatus = setMessage => {
  const { needsClaiming } = useBridgeContext();
  const { homeChainId, getBridgeChainId, getAMBAddress } = useBridgeDirection();
  const { ethersProvider, providerChainId: chainId } = useWeb3Context();
  const isHome = chainId === homeChainId;

  const bridgeChainId = getBridgeChainId(chainId);
  const { loading, setLoading, txHash, setTxHash, totalConfirms } =
    useBridgeContext();
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loadingText, setLoadingText] = useState();
  const [confirmations, setConfirmations] = useState(0);

  const completeReceipt = useCallback(() => {
    setTxHash();
    setLoading(false);
    setLoadingText();
    setConfirmations(0);
  }, [setLoading, setTxHash]);

  const incompleteReceipt = useCallback(() => {
    setLoading(false);
    setLoadingText();
    setConfirmations(0);
  }, [setLoading]);

  useEffect(() => {
    if (!loading) {
      setLoadingText();
      setConfirmations(0);
    }
  }, [loading]);

  const getStatus = useCallback(async () => {
    try {
      const txReceipt = await ethersProvider.getTransactionReceipt(txHash);
      const numConfirmations = txReceipt ? txReceipt.confirmations : 0;
      const enoughConfirmations = numConfirmations >= totalConfirms;

      if (txReceipt) {
        setConfirmations(numConfirmations);
        if (enoughConfirmations) {
          if (needsClaiming) {
            setLoadingText('Collecting Signatures');
            const message = await getMessage(
              isHome,
              ethersProvider,
              getAMBAddress(chainId),
              txHash,
            );
            if (message && message.signatures) {
              setNeedsConfirmation(true);
              incompleteReceipt();
              setMessage(message);
              return true;
            }
          } else {
            setLoadingText('Waiting for Execution');
            const bridgeProvider = await getEthersProvider(bridgeChainId);
            const bridgeAmbAddress = getAMBAddress(bridgeChainId);

            const { messageId } = await getMessageData(
              isHome,
              ethersProvider,
              txHash,
              txReceipt,
            );
            const status = await messageCallStatus(
              bridgeAmbAddress,
              bridgeProvider,
              messageId,
            );
            if (status) {
              completeReceipt();
              return true;
            }
          }
        }
      }
    } catch (txError) {
      if (
        needsClaiming &&
        txError &&
        txError.message === NOT_ENOUGH_COLLECTED_SIGNATURES
      ) {
        return false;
      }
      completeReceipt();
      logError({ txError });
      return true;
    }
    return false;
  }, [
    isHome,
    needsClaiming,
    txHash,
    ethersProvider,
    totalConfirms,
    completeReceipt,
    incompleteReceipt,
    chainId,
    bridgeChainId,
    getAMBAddress,
    setMessage,
  ]);

  useEffect(() => {
    if (!loading || !txHash || !ethersProvider) {
      return () => undefined;
    }

    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    setLoadingText('Waiting for Block Confirmations');
    let isSubscribed = true;

    const updateStatus = async () => {
      unsubscribe();
      const status = !isSubscribed || (await getStatus());
      if (!status && loading && txHash && ethersProvider) {
        unsubscribe();
        const timeoutId = setTimeout(() => updateStatus(), POLLING_INTERVAL);
        subscriptions.push(timeoutId);
      }
    };

    updateStatus();

    // unsubscribe when unmount component
    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [loading, txHash, ethersProvider, getStatus]);

  useEffect(() => {
    setNeedsConfirmation(needs => chainId === homeChainId && needs);
  }, [homeChainId, chainId]);

  return {
    loadingText,
    needsConfirmation,
    setNeedsConfirmation,
    confirmations,
  };
};
