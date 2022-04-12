import { useLocalState } from 'hooks/useLocalState';
import {
  ADDRESS_ZERO,
  DEFAULT_BRIDGE_DIRECTION,
  LOCAL_STORAGE_KEYS,
} from 'lib/constants';
import {
  fetchQueryParams,
  getDefaultToken,
  getNativeCurrency,
  getRPCKeys,
} from 'lib/helpers';
import { networks } from 'lib/networks';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';

const {
  INFINITE_UNLOCK,
  NEVER_SHOW_CLAIMS,
  DISABLE_BALANCE_WHILE_TOKEN_FETCH,
  BRIDGE_DIRECTION,
} = LOCAL_STORAGE_KEYS;

const SettingsContext = React.createContext({});

export const SettingsProvider = ({ children }) => {
  const [queryToken, setQueryToken] = useState(null);

  const [bridgeDirection, setBridgeDirection] = useLocalState(
    DEFAULT_BRIDGE_DIRECTION,
    BRIDGE_DIRECTION,
  );

  const history = useHistory();

  useEffect(() => {
    if (window.location.pathname === '/bridge') {
      const params = fetchQueryParams(window.location.search);

      if (params) {
        const fromChainId = parseInt(params.from, 10);
        const toChainId = parseInt(params.to, 10);
        const tokenAddress = params?.token;

        const networkEntry = Object.entries(networks).find(
          ([_, { homeChainId, foreignChainId }]) =>
            (homeChainId === fromChainId && foreignChainId === toChainId) ||
            (homeChainId === toChainId && foreignChainId === fromChainId),
        );

        if (tokenAddress && networkEntry) {
          setBridgeDirection(networkEntry[0], true);
          setQueryToken(
            tokenAddress === ADDRESS_ZERO &&
              networkEntry[1].enableForeignCurrencyBridge &&
              networkEntry[1].foreignChainId === fromChainId
              ? getNativeCurrency(fromChainId)
              : { chainId: fromChainId, address: tokenAddress },
          );
        } else if (networkEntry) {
          setBridgeDirection(networkEntry[0], true);
          setQueryToken(getDefaultToken(networkEntry[0], fromChainId));
        }
      }
    }
    history.replace({
      search: '',
    });
  }, [setBridgeDirection, history]);

  const { homeRPCKey, foreignRPCKey } = getRPCKeys(bridgeDirection);

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
    {
      valueType: 'boolean',
    },
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

  const settingsContext = useMemo(
    () => ({
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
      queryToken,
      setQueryToken,
    }),
    [
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
      queryToken,
      setQueryToken,
    ],
  );

  return (
    <SettingsContext.Provider value={settingsContext}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
