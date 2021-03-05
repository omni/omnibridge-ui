import { Web3Context } from 'contexts/Web3Context';
import { BigNumber } from 'ethers';
import { useCurrentDay } from 'hooks/useCurrentDay';
import { useFeeType } from 'hooks/useFeeType';
import { useRewardAddress } from 'hooks/useRewardAddress';
import { useTotalConfirms } from 'hooks/useTotalConfirms';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  transferTokens,
} from 'lib/bridge';
import { ADDRESS_ZERO, LARGEST_UINT256 } from 'lib/constants';
import {
  getBridgeNetwork,
  getDefaultToken,
  isxDaiChain,
  logError,
  parseValue,
} from 'lib/helpers';
import { approveToken, fetchAllowance, fetchTokenDetails } from 'lib/token';
import React, { useCallback, useContext, useEffect, useState } from 'react';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account, providerChainId } = useContext(Web3Context);

  const [receiver, setReceiver] = useState('');
  const [{ fromToken, toToken }, setTokens] = useState({});
  const [{ fromAmount, toAmount }, setAmounts] = useState({
    fromAmount: BigNumber.from(0),
    toAmount: BigNumber.from(0),
  });
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
    async inputAmount => {
      if (!fromToken || !toToken) return;
      setToAmountLoading(true);
      const amount = parseValue(inputAmount, fromToken.decimals);
      const isxDai = isxDaiChain(providerChainId);
      const feeType = !isxDai ? foreignToHomeFeeType : homeToForeignFeeType;
      const gotToAmount = await fetchToAmount(
        isRewardAddress,
        feeType,
        fromToken,
        toToken,
        amount,
      );
      setAmounts({ fromAmount: amount, toAmount: gotToAmount });
      setToAmountLoading(false);
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
    const [token, gotToToken] = await Promise.all([
      fetchTokenDetails(tokenWithoutMode),
      fetchToToken(tokenWithoutMode),
    ]);
    setTokens({ fromToken: token, toToken: gotToToken });
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
      throw approveError;
    } finally {
      setApprovalTxHash();
      setUnlockLoading(false);
    }
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
        setTokens({ fromToken: toToken, toToken: fromToken });
      } else if (!fromToken || fromToken.chainId !== chainId) {
        setToken(getDefaultToken(chainId));
      }
    },
    [setToken, fromToken, toToken],
  );

  useEffect(() => {
    setUpdateBalance(t => !t);
    setLoading(false);
    setDefaultToken(providerChainId);
  }, [providerChainId, setDefaultToken]);

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
