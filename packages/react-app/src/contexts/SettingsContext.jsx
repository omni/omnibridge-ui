import { useLocalState } from 'hooks/useLocalState';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const {
  INFINITE_UNLOCK,
  MAINNET_RPC_URL,
  XDAI_RPC_URL,
  NEVER_SHOW_CLAIMS,
  DISABLE_BALANCE_WHILE_TOKEN_FETCH,
} = LOCAL_STORAGE_KEYS;

const SettingsContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [mainnetRPC, setMainnetRPC] = useLocalState('', MAINNET_RPC_URL);
  const [xdaiRPC, setXDaiRPC] = useLocalState('', XDAI_RPC_URL);

  const [neverShowClaims, setNeverShowClaims] = useLocalState(
    false,
    NEVER_SHOW_CLAIMS,
    { valueType: 'boolean' },
  );

  const [infiniteUnlock, setInfiniteUnlock] = useLocalState(
    false,
    INFINITE_UNLOCK,
    { valueType: 'boolean' },
  );

  const [disableBalanceFetchToken, setDisableBalanceFetchToken] = useLocalState(
    false,
    DISABLE_BALANCE_WHILE_TOKEN_FETCH,
    {
      valueType: 'boolean',
    },
  );

  const [needsSaving, setNeedsSaving] = useState(false);

  const save = useCallback(() => {
    if (needsSaving) {
      setMainnetRPC(mRPC => mRPC, true);
      setXDaiRPC(xRPC => xRPC, true);
      setNeverShowClaims(nClaims => nClaims, true);
      setInfiniteUnlock(iUnlock => iUnlock, true);
      setDisableBalanceFetchToken(dBalanceToken => dBalanceToken, true);
      setNeedsSaving(false);
    }
  }, [
    setInfiniteUnlock,
    setDisableBalanceFetchToken,
    setMainnetRPC,
    setXDaiRPC,
    setNeverShowClaims,
    needsSaving,
  ]);

  useEffect(() => {
    if (
      window.localStorage.getItem(XDAI_RPC_URL) !== xdaiRPC ||
      window.localStorage.getItem(MAINNET_RPC_URL) !== mainnetRPC ||
      window.localStorage.getItem(NEVER_SHOW_CLAIMS) !==
        neverShowClaims.toString() ||
      window.localStorage.getItem(INFINITE_UNLOCK) !==
        infiniteUnlock.toString() ||
      window.localStorage.getItem(DISABLE_BALANCE_WHILE_TOKEN_FETCH) !==
        disableBalanceFetchToken.toString()
    ) {
      setNeedsSaving(true);
    }
  }, [
    mainnetRPC,
    xdaiRPC,
    neverShowClaims,
    infiniteUnlock,
    disableBalanceFetchToken,
  ]);

  return (
    <SettingsContext.Provider
      value={{
        mainnetRPC,
        setMainnetRPC,
        xdaiRPC,
        setXDaiRPC,
        infiniteUnlock,
        setInfiniteUnlock,
        neverShowClaims,
        setNeverShowClaims,
        disableBalanceFetchToken,
        setDisableBalanceFetchToken,
        needsSaving,
        setNeedsSaving,
        save,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
