import React, { useCallback, useContext, useEffect, useState } from 'react';

import { getMessageCallStatus, getMessageFromReceipt } from '../lib/amb';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  transferTokens,
} from '../lib/bridge';
import { getDefaultToken, isxDaiChain, uniqueTokens } from '../lib/helpers';
import { approveToken, fetchAllowance, fetchTokenBalance } from '../lib/token';
import { fetchTokenList } from '../lib/tokenList';
import { Web3Context } from './Web3Context';

const POLLING_INTERVAL = 2000;

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account } = useContext(Web3Context);

  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState();
  const [txHash, setTxHash] = useState();
  const [receipt, setReceipt] = useState();
  const [totalConfirms, setTotalConfirms] = useState(0);
  const [tokenList, setTokenList] = useState([]);
  const [amountInput, setAmountInput] = useState('');

  const setAmount = useCallback(
    async amount => {
      setFromAmount(amount);
      const gotToAmount = await fetchToAmount(fromToken, toToken, amount);
      setToAmount(gotToAmount);
      if (isxDaiChain(fromToken.chainId)) {
        setAllowed(true);
      } else if (window.BigInt(amount) <= 0) {
        setAllowed(false);
      } else {
        const gotAllowance = await fetchAllowance(
          fromToken.chainId,
          account,
          fromToken.address,
        );
        setAllowed(window.BigInt(gotAllowance) >= window.BigInt(amount));
      }
    },
    [account, fromToken, toToken],
  );

  const setToken = useCallback(
    async token => {
      setLoading(true);
      const tokenWithLimits = await fetchTokenLimits(token, account);
      setFromToken(tokenWithLimits);
      setAmountInput('');
      setFromAmount(0);
      setToToken();
      if (isxDaiChain(tokenWithLimits.chainId)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      const gotToToken = await fetchToToken(tokenWithLimits, account);
      setToToken(gotToToken);
      setToAmount(0);
      setLoading(false);
    },
    [account],
  );

  const setDefaultToken = useCallback(
    async chainId => {
      setFromToken();
      setToToken();
      setToken(getDefaultToken(chainId));
    },
    [setToken],
  );

  const approve = useCallback(async () => {
    setLoading(true);
    try {
      await approveToken(ethersProvider, fromToken, fromAmount);
      setAllowed(true);
    } catch (error) {
      // eslint-disable-next-line
      console.log({ approveError: error });
    }
    setLoading(false);
  }, [fromAmount, fromToken, ethersProvider]);

  const transfer = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, numConfirms] = await transferTokens(
        ethersProvider,
        fromToken,
        fromAmount,
      );
      setTotalConfirms(numConfirms);
      setTxHash(tx.hash);
    } catch (error) {
      setTxHash();
      setLoading(false);
      setLoadingText();
      // eslint-disable-next-line
      console.log({ transferError: error });
    }
  }, [fromToken, ethersProvider, fromAmount]);

  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };
    if (!txHash) return unsubscribe;

    const { chainId } = fromToken;
    let message = null;
    let status = false;

    const getReceipt = async () => {
      try {
        const txReceipt = await ethersProvider.getTransactionReceipt(txHash);
        setReceipt(txReceipt);

        if (txReceipt) {
          message = getMessageFromReceipt(chainId, txReceipt);
          // console.log(txReceipt.confirmations);
          if (txReceipt.confirmations > totalConfirms) {
            setLoadingText('Waiting for Execution');
          }
        }

        if (message) {
          status = await getMessageCallStatus(chainId, message);
        }

        if (status) {
          setTxHash();
          setReceipt();
          await setToken(fromToken);
          setLoading(false);
          setLoadingText();
        }

        if (!txReceipt || !message || !status) {
          const timeoutId = setTimeout(() => getReceipt(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (error) {
        setTxHash();
        setReceipt();
        setLoading(false);
        setLoadingText();
        // eslint-disable-next-line
        console.log({ receiptError: error });
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    getReceipt();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [txHash, totalConfirms, ethersProvider, setToken, fromToken]);

  const setDefaultTokenList = useCallback(
    async (chainId, customTokens) => {
      if (!account) return;
      setLoading(true);
      try {
        const baseTokenList = await fetchTokenList(chainId);
        const customTokenList = uniqueTokens(
          baseTokenList.concat(
            customTokens.filter(token => token.chainId === chainId),
          ),
        );
        const tokenListWithBalance = await Promise.all(
          customTokenList.map(async token => ({
            ...token,
            balance: await fetchTokenBalance(token, account),
          })),
        );
        const sortedTokenList = tokenListWithBalance.sort(function checkBalance(
          { balance: balanceA },
          { balance: balanceB },
        ) {
          return parseInt(
            window.BigInt(balanceB) - window.BigInt(balanceA),
            10,
          );
        });
        setTokenList(sortedTokenList);
      } catch (error) {
        // eslint-disable-next-line
        console.log({ fetchTokensError: error });
      }
      setLoading(false);
    },
    [account],
  );

  return (
    <BridgeContext.Provider
      value={{
        fromAmount,
        toAmount,
        setAmount,
        fromToken,
        toToken,
        setToken,
        setDefaultToken,
        allowed,
        approve,
        transfer,
        loading,
        loadingText,
        txHash,
        receipt,
        totalConfirms,
        tokenList,
        setDefaultTokenList,
        amountInput,
        setAmountInput,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
