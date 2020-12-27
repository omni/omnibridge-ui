import { useCallback, useContext, useEffect, useState } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { getMessageFromTxHash, getMessageStatus } from '../lib/amb';
import { POLLING_INTERVAL } from '../lib/constants';
import { getBridgeNetwork, isxDaiChain, logError } from '../lib/helpers';

export const useTransactionStatus = input => {
  const { ethersProvider, account, providerChainId } = useContext(Web3Context);
  const {
    loading,
    setLoading,
    fromToken,
    txHash,
    setTxHash,
    setToken,
    setUpdateFromAllowance,
  } = useContext(BridgeContext);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [receipt, setReceipt] = useState();
  const completeReceipt = useCallback(() => {
    setUpdateFromAllowance(a => !a);
    setLoadingText();
    setReceipt();
    setTxHash();
    setLoading(false);
  }, [setLoading, setUpdateFromAllowance, setTxHash]);

  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    if (!txHash || !ethersProvider || !loading || input) return unsubscribe;

    const chainId = providerChainId;
    let message = null;
    let status = false;
    const isxDai = isxDaiChain(chainId);

    const getReceipt = async () => {
      try {
        const txReceipt = await ethersProvider
          .getTransactionReceipt(txHash)
          .catch(contractError => logError({ contractError }));
        if (txReceipt) {
          setReceipt(txReceipt);
          if (isxDai) {
            setLoadingText('Collecting Signatures');
          } else if (txReceipt) {
            setLoadingText('Waiting for Execution');
          }

          if (txReceipt && (!message || (isxDai && !message.signatures))) {
            message = await getMessageFromTxHash(chainId, txHash);
          }

          if (isxDai) {
            if (message && message.signatures) {
              setNeedsConfirmation(true);
              completeReceipt();
              unsubscribe();
              return;
            }
          } else if (message) {
            status = await getMessageStatus(
              getBridgeNetwork(chainId),
              message.msgId,
            );
            if (status) {
              completeReceipt();
              unsubscribe();
              return;
            }
          }
        }

        if (
          !txReceipt ||
          !message ||
          (isxDai ? !message.signatures : !status)
        ) {
          const timeoutId = setTimeout(() => getReceipt(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (receiptError) {
        completeReceipt();
        unsubscribe();
        logError({ receiptError });
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    getReceipt();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [
    loading,
    providerChainId,
    txHash,
    ethersProvider,
    setToken,
    fromToken,
    account,
    setLoading,
    setReceipt,
    completeReceipt,
    input,
  ]);

  useEffect(() => {
    setNeedsConfirmation(needs => isxDaiChain(providerChainId) && needs);
  }, [providerChainId]);

  return {
    loadingText,
    needsConfirmation,
    setNeedsConfirmation,
    confirmations: receipt ? receipt.confirmations : 0,
  };
};
