import { useCallback, useContext, useEffect, useState } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { getMessageFromTxHash, getMessageStatus } from '../lib/amb';
import { POLLING_INTERVAL } from '../lib/constants';
import { getBridgeNetwork, isxDaiChain, logError } from '../lib/helpers';

export const useTransactionStatus = () => {
  const { ethersProvider, providerChainId } = useContext(Web3Context);
  const {
    loading,
    setLoading,
    txHash,
    setTxHash,
    setUpdateFromAllowance,
    totalConfirms,
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

    if (!txHash || !ethersProvider || !loading) return unsubscribe;

    const chainId = providerChainId;
    let message = null;
    let status = false;
    const isxDai = isxDaiChain(chainId);
    setLoadingText('Waiting for Block Confirmations');

    const getReceipt = async () => {
      try {
        const txReceipt = await ethersProvider
          .getTransactionReceipt(txHash)
          .catch(txReceiptError => {
            logError({ txReceiptError });
            unsubscribe();
            
          });
        if (txReceipt) {
          setReceipt(txReceipt);
          if (txReceipt.confirmations >= totalConfirms) {
            setLoadingText(
              isxDai ? 'Collecting Signatures' : 'Waiting for Execution',
            );
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
      } catch (txStatusError) {
        completeReceipt();
        unsubscribe();
        logError({ txStatusError });
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
    totalConfirms,
    completeReceipt,
    setReceipt,
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
