import React, { useCallback, useContext, useState } from 'react';

import { fetchDefaultToken, fetchToAmount, fetchToToken } from './helpers';
import { Web3Context } from './Web3Context';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account } = useContext(Web3Context);

  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);

  const setAmount = useCallback(
    async (amount) => {
      setFromAmount(amount);
      const gotToAmount = await fetchToAmount(toToken, amount);
      setToAmount(gotToAmount);
    },
    [toToken],
  );

  const setToken = useCallback(async (token) => {
    setFromToken(token);
    const gotToToken = await fetchToToken(token);
    setToToken(gotToToken);
  }, []);

  const setDefaultToken = useCallback(
    async (chainId) => {
      const token = await fetchDefaultToken(ethersProvider, account, chainId);
      setToken(token);
    },
    [ethersProvider, account, setToken],
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
