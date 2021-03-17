import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const {
  INFINITE_UNLOCK,
  MAINNET_RPC_URL,
  XDAI_RPC_URL,
  NEVER_SHOW_CLAIMS,
} = LOCAL_STORAGE_KEYS;

const SettingsContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [mainnetRPC, setMainnetRPC] = useState('');
  const [xdaiRPC, setXDaiRPC] = useState('');
  const [neverShowClaims, setNeverShowClaims] = useState(false);
  const [infiniteUnlock, setInfiniteUnlock] = useState(false);
  const [tokenListWithBalance, setTokenListWithBalance] = useState(false);

  const [trigger, shouldTrigger] = useState(false);

  const [needsSaving, setNeedsSaving] = useState(false);

  useEffect(() => {
    setMainnetRPC(window.localStorage.getItem(MAINNET_RPC_URL) || '');
    setXDaiRPC(window.localStorage.getItem(XDAI_RPC_URL) || '');
    setNeverShowClaims(
      window.localStorage.getItem(NEVER_SHOW_CLAIMS) === 'true',
    );
    setInfiniteUnlock(window.localStorage.getItem(INFINITE_UNLOCK) === 'true');
    setNeedsSaving(false);
  }, [trigger]);

  const update = () => shouldTrigger(t => !t);
  const save = useCallback(() => {
    if (needsSaving) {
      window.localStorage.setItem(MAINNET_RPC_URL, mainnetRPC);
      window.localStorage.setItem(XDAI_RPC_URL, xdaiRPC);
      window.localStorage.setItem(NEVER_SHOW_CLAIMS, neverShowClaims);
      window.localStorage.setItem(INFINITE_UNLOCK, infiniteUnlock);
      setNeedsSaving(false);
    }
  }, [mainnetRPC, xdaiRPC, neverShowClaims, infiniteUnlock, needsSaving]);

  useEffect(() => {
    if (
      window.localStorage.getItem(XDAI_RPC_URL) !== xdaiRPC ||
      window.localStorage.getItem(MAINNET_RPC_URL) !== mainnetRPC ||
      (window.localStorage.getItem(NEVER_SHOW_CLAIMS) === 'true') !==
        neverShowClaims ||
      (window.localStorage.getItem(INFINITE_UNLOCK) === 'true') !==
        infiniteUnlock
    ) {
      setNeedsSaving(true);
    }
  }, [mainnetRPC, xdaiRPC, neverShowClaims, infiniteUnlock]);

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
        tokenListWithBalance,
        setTokenListWithBalance,
        update,
        save,
        needsSaving,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
