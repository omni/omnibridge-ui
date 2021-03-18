import { useLocalState } from 'hooks/useLocalState';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import React, { useCallback, useContext } from 'react';

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
    'boolean',
  );
  const [infiniteUnlock, setInfiniteUnlock] = useLocalState(
    false,
    INFINITE_UNLOCK,
    'boolean',
  );
  const [disableBalanceFetchToken, setDisableBalanceFetchToken] = useLocalState(
    false,
    DISABLE_BALANCE_WHILE_TOKEN_FETCH,
    'boolean',
  );

  const save = useCallback(() => {
    setMainnetRPC(mRPC => mRPC);
    setXDaiRPC(xRPC => xRPC);
    setNeverShowClaims(nClaims => nClaims);
    setInfiniteUnlock(iUnlock => iUnlock);
  }, [setInfiniteUnlock, setMainnetRPC, setXDaiRPC, setNeverShowClaims]);

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
        save,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
