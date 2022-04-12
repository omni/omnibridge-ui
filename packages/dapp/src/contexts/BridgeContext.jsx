import { useToast } from '@chakra-ui/react';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { BigNumber } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useFeeManager } from 'hooks/useFeeManager';
import { useMediatorInfo } from 'hooks/useMediatorInfo';
import { fetchToAmount, fetchToToken, relayTokens } from 'lib/bridge';
import { ADDRESS_ZERO } from 'lib/constants';
import {
  getDefaultToken,
  getHelperContract,
  getMediatorAddress,
  getNativeCurrency,
  getNetworkLabel,
  logError,
  parseValue,
} from 'lib/helpers';
import { fetchTokenDetails } from 'lib/token';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const BridgeContext = React.createContext({});

export const useBridgeContext = () => useContext(BridgeContext);

export const BridgeProvider = ({ children }) => {
  const { queryToken, setQueryToken } = useSettings();
  const { isGnosisSafe, ethersProvider, account, providerChainId } =
    useWeb3Context();
  const { bridgeDirection, getBridgeChainId, homeChainId, foreignChainId } =
    useBridgeDirection();

  const [receiver, setReceiver] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [{ fromToken, toToken }, setTokens] = useState({
    fromToken: null,
    toToken: null,
  });
  const [{ fromAmount, toAmount }, setAmounts] = useState({
    fromAmount: BigNumber.from(0),
    toAmount: BigNumber.from(0),
  });
  const [toAmountLoading, setToAmountLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shouldReceiveNativeCur, setShouldReceiveNativeCur] = useState(false);
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [txHash, setTxHash] = useState();

  const toast = useToast();
  const { feeManagerAddress } = useMediatorInfo();
  const { isRewardAddress, homeToForeignFeeType, foreignToHomeFeeType } =
    useFeeManager();

  const isHome = providerChainId === homeChainId;
  const feeType = isHome ? homeToForeignFeeType : foreignToHomeFeeType;

  const getToAmount = useCallback(
    async amount =>
      isRewardAddress
        ? amount
        : fetchToAmount(
            bridgeDirection,
            feeType,
            fromToken,
            toToken,
            amount,
            feeManagerAddress,
          ),
    [
      bridgeDirection,
      fromToken,
      toToken,
      isRewardAddress,
      feeManagerAddress,
      feeType,
    ],
  );

  const cleanAmounts = useCallback(() => {
    setAmountInput('0.0');
    setAmounts({
      fromAmount: BigNumber.from(0),
      toAmount: BigNumber.from(0),
    });
  }, []);

  const setAmount = useCallback(
    async inputAmount => {
      if (!fromToken || !toToken) return;
      setToAmountLoading(true);
      const amount = parseValue(inputAmount, fromToken.decimals);
      const gotToAmount = await getToAmount(amount);
      setAmounts({ fromAmount: amount, toAmount: gotToAmount });
      setToAmountLoading(false);
    },
    [fromToken, toToken, getToAmount],
  );

  const setToToken = useCallback(
    newToToken => {
      setTokens(prevTokens => ({
        fromToken: prevTokens.fromToken,
        toToken: { ...newToToken },
      }));
    },
    [setTokens],
  );

  const setToken = useCallback(
    async (tokenWithoutMode, isQueryToken = false) => {
      if (!tokenWithoutMode) return false;
      try {
        const [token, gotToToken] = await Promise.all([
          tokenWithoutMode?.address === ADDRESS_ZERO
            ? {
                ...getNativeCurrency(tokenWithoutMode.chainId),
                mediator: getMediatorAddress(bridgeDirection, tokenWithoutMode),
                helperContractAddress: getHelperContract(
                  tokenWithoutMode.chainId,
                ),
              }
            : fetchTokenDetails(bridgeDirection, tokenWithoutMode),
          fetchToToken(
            bridgeDirection,
            tokenWithoutMode,
            getBridgeChainId(tokenWithoutMode.chainId),
          ),
        ]);
        setTokens({ fromToken: token, toToken: { ...token, ...gotToToken } });
        const label = getNetworkLabel(token.chainId).toUpperCase();
        const storageKey = `${bridgeDirection.toUpperCase()}-${label}-FROM-TOKEN`;
        localStorage.setItem(storageKey, JSON.stringify(token));
        return true;
      } catch (tokenDetailsError) {
        toast({
          title: 'Error',
          description: !isQueryToken
            ? 'Cannot fetch token details. Wait for a few minutes and reload the application'
            : 'Token not found.',
          status: 'error',
          duration: isQueryToken ? 2000 : null,
          isClosable: !isQueryToken,
        });
        logError({ tokenDetailsError });
        return false;
      }
    },
    [bridgeDirection, getBridgeChainId, toast],
  );

  const transfer = useCallback(async () => {
    if (isGnosisSafe && !receiver) {
      throw new Error('Must set receiver for Gnosis Safe');
    }
    try {
      setLoading(true);
      const tx = await relayTokens(
        ethersProvider,
        fromToken,
        receiver || account,
        fromAmount,
        {
          shouldReceiveNativeCur:
            shouldReceiveNativeCur &&
            toToken?.address === ADDRESS_ZERO &&
            toToken?.mode === 'NATIVE',
          foreignChainId,
        },
      );
      setTxHash(tx.hash);
    } catch (transferError) {
      logError({
        transferError,
        fromToken,
        receiver: receiver || account,
        fromAmount: fromAmount.toString(),
        account,
      });
      throw transferError;
    } finally {
      setLoading(false);
    }
  }, [
    isGnosisSafe,
    fromToken,
    toToken,
    account,
    receiver,
    ethersProvider,
    fromAmount,
    shouldReceiveNativeCur,
    foreignChainId,
  ]);

  const switchTokens = useCallback(() => {
    setTokens(({ fromToken: from, toToken: to }) => ({
      fromToken: to,
      toToken: from,
    }));
    cleanAmounts();
  }, [cleanAmounts]);

  const setDefaultToken = useCallback(
    async chainId => {
      const token = getDefaultToken(bridgeDirection, chainId);
      if (
        !fromToken ||
        (token?.chainId !== fromToken?.chainId &&
          token?.address !== fromToken?.address)
      ) {
        cleanAmounts();
        await setToken(token);
      }
    },
    [setToken, bridgeDirection, cleanAmounts, fromToken],
  );

  useEffect(
    () =>
      (async () => {
        setLoading(true);
        let tokenSet = false;
        if (queryToken) {
          tokenSet = await setToken(queryToken, true);
          setQueryToken(null);
        }
        if (
          !tokenSet &&
          (!fromToken ||
            ![homeChainId, foreignChainId].includes(fromToken.chainId) ||
            (fromToken.address === ADDRESS_ZERO && fromToken.mode !== 'NATIVE'))
        ) {
          await setDefaultToken(homeChainId);
        }
        setLoading(false);
      })(),
    [
      queryToken,
      setQueryToken,
      setDefaultToken,
      setToken,
      fromToken,
      homeChainId,
      foreignChainId,
    ],
  );

  useEffect(() => {
    if (
      toToken?.chainId === foreignChainId &&
      toToken?.address === ADDRESS_ZERO &&
      toToken?.mode === 'NATIVE'
    ) {
      setShouldReceiveNativeCur(true);
    } else {
      setShouldReceiveNativeCur(false);
    }
  }, [fromToken, toToken, foreignChainId]);

  const bridgeContext = useMemo(
    () => ({
      // amounts & balances
      amountInput,
      setAmountInput,
      fromAmount,
      toAmount,
      toAmountLoading,
      setAmount,
      fromBalance,
      setFromBalance,
      toBalance,
      setToBalance,
      // tokens
      fromToken,
      toToken,
      setToToken,
      setToken,
      setDefaultToken,
      switchTokens,
      // bridge
      transfer,
      loading,
      setLoading,
      txHash,
      setTxHash,
      // misc
      receiver,
      setReceiver,
      shouldReceiveNativeCur,
      setShouldReceiveNativeCur,
    }),
    [
      // amounts & balances
      amountInput,
      setAmountInput,
      fromAmount,
      toAmount,
      toAmountLoading,
      setAmount,
      fromBalance,
      setFromBalance,
      toBalance,
      setToBalance,
      // tokens
      fromToken,
      toToken,
      setToToken,
      setToken,
      setDefaultToken,
      switchTokens,
      // bridge
      transfer,
      loading,
      setLoading,
      txHash,
      setTxHash,
      // misc
      receiver,
      setReceiver,
      shouldReceiveNativeCur,
      setShouldReceiveNativeCur,
    ],
  );

  return (
    <BridgeContext.Provider value={bridgeContext}>
      {children}
    </BridgeContext.Provider>
  );
};
