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
  wrapAndRelayTokens,
} from 'lib/bridge';
import { ADDRESS_ZERO, NATIVE_CURRENCY_SYBMOLS } from 'lib/constants';
import { getDefaultToken, logError, parseValue } from 'lib/helpers';
import { fetchTokenDetails } from 'lib/token';
import React, { useCallback, useEffect, useState } from 'react';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { queryToken, setQueryToken } = useSettings();
  const { ethersProvider, account, providerChainId } = useWeb3Context();
  const {
    bridgeDirection,
    getBridgeChainId,
    homeChainId,
  } = useBridgeDirection();

  const [receiver, setReceiver] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [{ fromToken, toToken }, setTokens] = useState({});
  const [{ fromAmount, toAmount }, setAmounts] = useState({
    fromAmount: BigNumber.from(0),
    toAmount: BigNumber.from(0),
  });
  const [toAmountLoading, setToAmountLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updateBalance, setUpdateBalance] = useState(false);
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [txHash, setTxHash] = useState();
  const [tokenLimits, setTokenLimits] = useState();

  const toast = useToast();
  const totalConfirms = useTotalConfirms();
  const { currentDay, feeManagerAddress } = useMediatorInfo();
  const {
    isRewardAddress,
    homeToForeignFeeType,
    foreignToHomeFeeType,
  } = useFeeManager();
  const {
    allowed,
    updateAllowance,
    unlockLoading,
    approvalTxHash,
    approve,
  } = useApproval(fromToken, fromAmount);

  const setAmount = useCallback(
    async inputAmount => {
      if (!fromToken || !toToken) return;
      setToAmountLoading(true);
      const amount = parseValue(inputAmount, fromToken.decimals);
      const isHome = providerChainId === homeChainId;
      const feeType = !isHome ? foreignToHomeFeeType : homeToForeignFeeType;
      const gotToAmount = isRewardAddress
        ? amount
        : await fetchToAmount(
            bridgeDirection,
            feeType,
            fromToken,
            toToken,
            amount,
            feeManagerAddress,
          );

      setAmounts({ fromAmount: amount, toAmount: gotToAmount });
      setToAmountLoading(false);
    },
    [
      homeChainId,
      bridgeDirection,
      fromToken,
      toToken,
      providerChainId,
      isRewardAddress,
      homeToForeignFeeType,
      foreignToHomeFeeType,
      feeManagerAddress,
    ],
  );

  const setToken = useCallback(
    async (tokenWithoutMode, isQueryToken = false) => {
      try {
        const [token, gotToToken] = await Promise.all([
          fetchTokenDetails(bridgeDirection, tokenWithoutMode),
          fetchToToken(
            bridgeDirection,
            tokenWithoutMode,
            getBridgeChainId(tokenWithoutMode.chainId),
          ),
        ]);
        setTokens({ fromToken: token, toToken: { ...token, ...gotToToken } });
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
      const tx = NATIVE_CURRENCY_SYBMOLS.includes(fromToken.symbol)
        ? await wrapAndRelayTokens(
            ethersProvider,
            fromToken,
            receiver || account,
            fromAmount,
          )
        : await relayTokens(
            ethersProvider,
            fromToken,
            receiver || account,
            fromAmount,
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
  }, [fromToken, account, receiver, ethersProvider, fromAmount]);

  const setDefaultToken = useCallback(
    async chainId => {
      if (
        fromToken &&
        toToken &&
        toToken.chainId === chainId &&
        toToken.address !== ADDRESS_ZERO
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
        await setToken(getDefaultToken(chainId));
      }
    },
    [setToken, fromToken, toToken, getBridgeChainId],
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
    setUpdateBalance(t => !t);
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

  useEffect(() => {
    updateToken();
  }, [updateToken]);

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
    setUpdateBalance(t => !t);
  }, [txHash]);

  return (
    <BridgeContext.Provider
      value={{
        fromAmount,
        toAmount,
        toAmountLoading,
        setAmount,
        fromToken,
        toToken,
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
        updateAllowance,
        receiver,
        setReceiver,
        updateBalance,
        setUpdateBalance,
        unlockLoading,
        approvalTxHash,
        feeManagerAddress,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
