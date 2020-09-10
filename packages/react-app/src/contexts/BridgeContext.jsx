import React, { useCallback, useContext, useState } from 'react';

import {
  fetchToAmount,
  fetchTokenBalance,
  fetchTokenDetails,
  fetchToToken,
  transferTokens,
} from '../lib/bridge';
import { getDefaultToken, isxDaiChain, uniqueTokens } from '../lib/helpers';
import { approveToken, fetchAllowance } from '../lib/token';
import { fetchTokenList } from '../lib/tokenList';
import { Web3Context } from './Web3Context';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account } = useContext(Web3Context);

  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(false);
  const [totalConfirms, setTotalConfirms] = useState(0);
  const [tokenList, setTokenList] = useState([]);

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
      const tokenWithDetails = await fetchTokenDetails(token, account);
      setFromToken(tokenWithDetails);
      setFromAmount(0);
      setToToken();
      if (isxDaiChain(tokenWithDetails.chainId)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      const gotToToken = await fetchToToken(tokenWithDetails, account);
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
      setTransaction(tx);
      const handler = async () => {
        const receipt = await ethersProvider.getTransactionReceipt(tx.hash);
        if (receipt) {
          receipt.hash = tx.hash;
          setTransaction(receipt);
        }
      };

      ethersProvider.on('block', handler);
      await tx.wait(numConfirms);
      ethersProvider.removeListener('block', handler);
      await setToken(fromToken);
      setTransaction();
    } catch (error) {
      // eslint-disable-next-line
      console.log({ transferError: error });
    }
    setLoading(false);
  }, [fromToken, ethersProvider, fromAmount, setToken]);

  const setDefaultTokenList = useCallback(
    async (chainId, customTokens) => {
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
        transaction,
        totalConfirms,
        tokenList,
        setDefaultTokenList,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
