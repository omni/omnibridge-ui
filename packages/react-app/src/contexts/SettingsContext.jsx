import { useLocalState } from 'hooks/useLocalState';
import { DEFAULT_BRIDGE_DIRECTION, LOCAL_STORAGE_KEYS } from 'lib/constants';
import { getRPCKeys } from 'lib/helpers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

const {
  INFINITE_UNLOCK,
  NEVER_SHOW_CLAIMS,
  DISABLE_BALANCE_WHILE_TOKEN_FETCH,
  BRIDGE_DIRECTION,
} = LOCAL_STORAGE_KEYS;

const SettingsContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [
    bridgeDirection,
    setBridgeDirection,
  ] = useLocalState(DEFAULT_BRIDGE_DIRECTION, BRIDGE_DIRECTION, {
    isStoredImmediately: true,
  });

  const [{ homeRPCKey, foreignRPCKey }, setRPCKeys] = useState(
    getRPCKeys(DEFAULT_BRIDGE_DIRECTION),
  );

  useEffect(() => {
    setRPCKeys(getRPCKeys(bridgeDirection));
  }, [bridgeDirection]);

  const [foreignRPC, setForeignRPC] = useLocalState('', foreignRPCKey);
  const [homeRPC, setHomeRPC] = useLocalState('', homeRPCKey);

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
      setBridgeDirection(bNet => bNet, true);
      setForeignRPC(mRPC => mRPC, true);
      setHomeRPC(xRPC => xRPC, true);
      setNeverShowClaims(nClaims => nClaims, true);
      setInfiniteUnlock(iUnlock => iUnlock, true);
      setDisableBalanceFetchToken(dBalanceToken => dBalanceToken, true);
      setNeedsSaving(false);
    }
  }, [
    setBridgeDirection,
    setInfiniteUnlock,
    setDisableBalanceFetchToken,
    setForeignRPC,
    setHomeRPC,
    setNeverShowClaims,
    needsSaving,
  ]);

  useEffect(() => {
    if (
      window.localStorage.getItem(homeRPCKey) !== homeRPC ||
      window.localStorage.getItem(foreignRPCKey) !== foreignRPC ||
      window.localStorage.getItem(NEVER_SHOW_CLAIMS) !==
        neverShowClaims.toString() ||
      window.localStorage.getItem(INFINITE_UNLOCK) !==
        infiniteUnlock.toString() ||
      window.localStorage.getItem(DISABLE_BALANCE_WHILE_TOKEN_FETCH) !==
        disableBalanceFetchToken.toString()
    ) {
      setNeedsSaving(true);
    } else {
      setNeedsSaving(false);
    }
  }, [
    foreignRPCKey,
    foreignRPC,
    homeRPCKey,
    homeRPC,
    neverShowClaims,
    infiniteUnlock,
    disableBalanceFetchToken,
  ]);

  return (
    <SettingsContext.Provider
      value={{
        bridgeDirection,
        setBridgeDirection,
        foreignRPC,
        setForeignRPC,
        homeRPC,
        setHomeRPC,
        infiniteUnlock,
        setInfiniteUnlock,
        neverShowClaims,
        setNeverShowClaims,
        disableBalanceFetchToken,
        setDisableBalanceFetchToken,
        needsSaving,
        save,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
