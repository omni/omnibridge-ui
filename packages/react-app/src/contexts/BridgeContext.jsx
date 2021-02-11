import { BigNumber } from 'ethers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useCurrentDay } from '../hooks/useCurrentDay';
import { useFeeType } from '../hooks/useFeeType';
import { useRewardAddress } from '../hooks/useRewardAddress';
import { useTotalConfirms } from '../hooks/useTotalConfirms';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  transferTokens,
} from '../lib/bridge';
import { ADDRESS_ZERO, LARGEST_UINT256 } from '../lib/constants';
import {
  getBridgeNetwork,
  getDefaultToken,
  isxDaiChain,
  logError,
} from '../lib/helpers';
import { approveToken, fetchAllowance, fetchTokenDetails } from '../lib/token';
import { Web3Context } from './Web3Context';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account, providerChainId } = useContext(Web3Context);

  const [receiver, setReceiver] = useState('');
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [toAmountLoading, setToAmountLoading] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState();
  const [amountInput, setAmountInput] = useState('');
  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [tokenLimits, setTokenLimits] = useState();

  const totalConfirms = useTotalConfirms();
  const isRewardAddress = useRewardAddress();
  const currentDay = useCurrentDay();
  const { homeToForeignFeeType, foreignToHomeFeeType } = useFeeType();
  const [fromAllowance, setAllowance] = useState(BigNumber.from(0));
  const [updateFromAllowance, setUpdateFromAllowance] = useState(false);
  const [updateBalance, setUpdateBalance] = useState(false);

  useEffect(() => {
    if (fromToken && providerChainId === fromToken.chainId) {
      fetchAllowance(fromToken, account, ethersProvider).then(setAllowance);
    }
  }, [
    ethersProvider,
    account,
    fromToken,
    providerChainId,
    updateFromAllowance,
  ]);

  useEffect(() => {
    setAllowed(
      (fromToken && fromToken.mode === 'erc677') ||
        fromAllowance.gte(fromAmount),
    );
  }, [fromAmount, fromAllowance, fromToken]);

  const setAmount = useCallback(
    amount => {
      setFromAmount(amount);
      setToAmountLoading(true);
      const isxDai = isxDaiChain(providerChainId);
      const feeType = !isxDai ? foreignToHomeFeeType : homeToForeignFeeType;
      fetchToAmount(isRewardAddress, feeType, fromToken, toToken, amount).then(
        gotToAmount => {
          setToAmount(gotToAmount);
          setToAmountLoading(false);
        },
      );
    },
    [
      fromToken,
      toToken,
      providerChainId,
      isRewardAddress,
      homeToForeignFeeType,
      foreignToHomeFeeType,
    ],
  );

  const setToken = useCallback(async tokenWithoutMode => {
    setLoading(true);
    setAmountInput('');
    setFromAmount(0);
    setAllowed(true);
    setToAmount(0);
    const [token, gotToToken] = await Promise.all([
      fetchTokenDetails(tokenWithoutMode),
      fetchToToken(tokenWithoutMode),
    ]);
    setToToken(gotToToken);
    setFromToken(token);
    setLoading(false);
  }, []);

  const [unlockLoading, setUnlockLoading] = useState(false);

  const [approvalTxHash, setApprovalTxHash] = useState();
  const approve = useCallback(async () => {
    setUnlockLoading(true);
    const approvalAmount =
      window.localStorage.getItem('infinite-unlock') === 'true'
        ? LARGEST_UINT256
        : fromAmount;
    try {
      const tx = await approveToken(ethersProvider, fromToken, approvalAmount);
      setApprovalTxHash(tx.hash);
      await tx.wait();
      setAllowance(approvalAmount);
    } catch (approveError) {
      logError({
        approveError,
        fromToken,
        approvalAmount: approvalAmount.toString(),
        account,
      });
    }
    setApprovalTxHash();
    setUnlockLoading(false);
  }, [fromAmount, fromToken, ethersProvider, account]);

  const transfer = useCallback(async () => {
    setLoading(true);
    try {
      const tx = await transferTokens(
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
    chainId => {
      if (
        fromToken &&
        toToken &&
        toToken.chainId === chainId &&
        toToken.address !== ADDRESS_ZERO
      ) {
        const token = { ...toToken };
        setToToken(fromToken);
        setFromToken(token);
      } else if (!fromToken || fromToken.chainId !== chainId) {
        setToken(getDefaultToken(chainId));
      }
    },
    [setToken, fromToken, toToken],
  );

  useEffect(() => {
    setAmountInput('');
    setAmount(BigNumber.from(0));
    setUpdateBalance(t => !t);
    setLoading(false);
    setDefaultToken(providerChainId);
  }, [providerChainId, setAmount, setDefaultToken]);

  const updateTokenLimits = useCallback(async () => {
    if (
      providerChainId &&
      fromToken &&
      fromToken.chainId === providerChainId &&
      toToken &&
      toToken.chainId === getBridgeNetwork(providerChainId) &&
      ethersProvider &&
      fromToken.symbol === toToken.symbol &&
      currentDay
    ) {
      const limits = await fetchTokenLimits(
        ethersProvider,
        fromToken,
        toToken,
        currentDay,
      );
      setTokenLimits(limits);
    }
  }, [fromToken, toToken, currentDay, providerChainId, ethersProvider]);

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
        setUpdateFromAllowance,
        receiver,
        setReceiver,
        updateBalance,
        setUpdateBalance,
        unlockLoading,

        approvalTxHash,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
