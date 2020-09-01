import React, { useCallback, useContext, useState } from 'react';

import { fetchDefaultToken, fetchToAmount, fetchToToken } from '../lib/bridge';
import { Web3Context } from './Web3Context';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { account } = useContext(Web3Context);

  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);

  const setAmount = useCallback(
    async (amount) => {
      setFromAmount(amount);
      const gotToAmount = await fetchToAmount(fromToken, toToken, amount);
      setToAmount(gotToAmount);
    },
    [fromToken, toToken],
  );

  const setToken = useCallback(
    async (token) => {
      setFromToken(token);
      setFromAmount(0);
      setToToken();
      const gotToToken = await fetchToToken(account, token);
      setToToken(gotToToken);
      setToAmount(0);
    },
    [account],
  );

  const setDefaultToken = useCallback(
    async (chainId) => {
      setFromToken();
      setToToken();
      const token = await fetchDefaultToken(account, chainId);
      setToken(token);
    },
    [account, setToken],
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
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
