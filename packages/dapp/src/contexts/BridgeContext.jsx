import { useToast } from '@chakra-ui/react';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { BigNumber } from 'ethers';
import { useApproval } from 'hooks/useApproval';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useFeeManager } from 'hooks/useFeeManager';
import { useMediatorInfo } from 'hooks/useMediatorInfo';
import { useTotalConfirms } from 'hooks/useTotalConfirms';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  relayTokens,
} from 'lib/bridge';
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
  const {
    bridgeDirection,
    getBridgeChainId,
    homeChainId,
    foreignChainId,
    claimDisabled,
    tokensClaimDisabled,
  } = useBridgeDirection();

  const isHome = providerChainId === homeChainId;

  const [receiver, setReceiver] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [{ fromToken, toToken }, setTokens] = useState({});
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
  const [tokenLimits, setTokenLimits] = useState();

  const toast = useToast();
  const totalConfirms = useTotalConfirms();
  const { currentDay, feeManagerAddress } = useMediatorInfo();
  const { isRewardAddress, homeToForeignFeeType, foreignToHomeFeeType } =
    useFeeManager();
  const { allowed, unlockLoading, approvalTxHash, approve } = useApproval(
    fromToken,
    fromAmount,
    txHash,
  );

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
    setLoading(true);
    try {
      if (isGnosisSafe && !receiver) {
        throw new Error('Must set receiver for Gnosis Safe');
      }
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
      setLoading(false);
      logError({
        transferError,
        fromToken,
        receiver: receiver || account,
        fromAmount: fromAmount.toString(),
        account,
      });
      throw transferError;
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

  const setDefaultToken = useCallback(
    async chainId => {
      if (
        fromToken &&
        toToken &&
        toToken.chainId === chainId &&
        (toToken.address !== ADDRESS_ZERO || toToken.mode === 'NATIVE')
      ) {
        setTokens({ fromToken: toToken, toToken: fromToken });
      } else if (
        !(
          fromToken &&
          toToken &&
          fromToken.chainId === chainId &&
          toToken.chainId === getBridgeChainId(chainId)
        )
      ) {
        await setToken(getDefaultToken(bridgeDirection, chainId));
      }
    },
    [setToken, fromToken, toToken, getBridgeChainId, bridgeDirection],
  );

  const updateToken = useCallback(async () => {
    setLoading(true);
    if (!queryToken) {
      await setDefaultToken(providerChainId);
    } else if (
      !(
        fromToken &&
        toToken &&
        fromToken.chainId === providerChainId &&
        toToken.chainId === getBridgeChainId(providerChainId)
      )
    ) {
      const isQueryTokenSet = await setToken(queryToken, true);
      if (!isQueryTokenSet) {
        await setDefaultToken(providerChainId);
      }
      setQueryToken(null);
    }
    setLoading(false);
  }, [
    queryToken,
    setQueryToken,
    providerChainId,
    setDefaultToken,
    setToken,
    fromToken,
    toToken,
    getBridgeChainId,
  ]);

  const updateTokenLimits = useCallback(async () => {
    if (
      providerChainId &&
      ethersProvider &&
      fromToken &&
      toToken &&
      fromToken.chainId === providerChainId &&
      toToken.chainId === getBridgeChainId(providerChainId) &&
      fromToken.symbol === toToken.symbol &&
      currentDay &&
      bridgeDirection
    ) {
      const limits = await fetchTokenLimits(
        bridgeDirection,
        ethersProvider,
        fromToken,
        toToken,
        currentDay,
      );
      setTokenLimits(limits);
    }
  }, [
    providerChainId,
    fromToken,
    toToken,
    getBridgeChainId,
    ethersProvider,
    currentDay,
    bridgeDirection,
  ]);

  useEffect(() => {
    updateTokenLimits();
  }, [updateTokenLimits]);

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
  }, [fromToken, toToken, setShouldReceiveNativeCur, foreignChainId]);

  useEffect(() => {
    updateToken();
  }, [updateToken]);

  const needsClaiming = useMemo(
    () =>
      isHome &&
      !claimDisabled &&
      !(tokensClaimDisabled || []).includes(fromToken?.address.toLowerCase()),
    [isHome, claimDisabled, tokensClaimDisabled, fromToken],
  );

  return (
    <BridgeContext.Provider
      value={{
        fromAmount,
        toAmount,
        toAmountLoading,
        setAmount,
        fromToken,
        toToken,
        setToToken,
        setToken,
        setDefaultToken,
        allowed,
        approve,
        transfer,
        loading,
        setLoading,
        txHash,
        setTxHash,
        totalConfirms,
        amountInput,
        setAmountInput,
        fromBalance,
        setFromBalance,
        toBalance,
        setToBalance,
        tokenLimits,
        updateTokenLimits,
        receiver,
        setReceiver,
        shouldReceiveNativeCur,
        setShouldReceiveNativeCur,
        unlockLoading,
        approvalTxHash,
        feeManagerAddress,
        needsClaiming,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
