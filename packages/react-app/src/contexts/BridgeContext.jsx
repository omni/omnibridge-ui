import React, { useCallback, useContext, useState } from 'react';

import { fetchDefaultToken, fetchToAmount, fetchToToken } from '../lib/bridge';
import { isxDaiChain } from '../lib/helpers';
import { approveToken, fetchAllowance } from '../lib/token';
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

  const setAmount = useCallback(
    async amount => {
      setFromAmount(amount);
      const gotToAmount = await fetchToAmount(fromToken, toToken, amount);
      setToAmount(gotToAmount);
      if (isxDaiChain(fromToken.chainId)) {
        setAllowed(true);
      } else {
        const gotAllowance = await fetchAllowance(
          fromToken.chainId,
          account,
          fromToken.address,
        );
        setAllowed(gotAllowance >= amount);
      }
    },
    [account, fromToken, toToken],
  );

  const setToken = useCallback(
    async token => {
      setFromToken(token);
      setFromAmount(0);
      setToToken();
      if (isxDaiChain(token.chainId)) {
        setAllowed(true);
      } else {
        setAllowed(false);
      }
      const gotToToken = await fetchToToken(account, token);
      setToToken(gotToToken);
      setToAmount(0);
    },
    [account],
  );

  const setDefaultToken = useCallback(
    async chainId => {
      setFromToken();
      setToToken();
      const token = await fetchDefaultToken(account, chainId);
      setToken(token);
    },
    [account, setToken],
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
        loading,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
