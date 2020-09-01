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
      setAmount(0);
      setFromToken(token);
      const gotToToken = await fetchToToken(account, token);
      setToToken(gotToToken);
    },
    [account, setAmount],
  );

  const setDefaultToken = useCallback(
    async (chainId) => {
      setAmount(0);
      const token = await fetchDefaultToken(account, chainId);
      setToken(token);
    },
    [account, setToken, setAmount],
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
