import { BigNumber } from 'ethers';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { useFeeType } from '../hooks/useFeeType';
import { useRewardAddress } from '../hooks/useRewardAddress';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  transferTokens,
} from '../lib/bridge';
import { ADDRESS_ZERO, LARGEST_UINT256 } from '../lib/constants';
import {
  defaultDailyLimit,
  defaultMaxPerTx,
  defaultMinPerTx,
  getDefaultToken,
  isxDaiChain,
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

  const [totalConfirms, setTotalConfirms] = useState(0);
  const isRewardAddress = useRewardAddress();
  const { homeToForeignFeeType, foreignToHomeFeeType } = useFeeType();
  const [fromAllowance, setAllowance] = useState(BigNumber.from(0));
  const [updateFromAllowance, setUpdateFromAllowance] = useState(false);

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

  const setToken = useCallback(
    async tokenWithoutMode => {
      setLoading(true);
      setAmountInput('');
      setFromAmount(0);
      setAllowed(true);
      setToAmount(0);
      const [token, gotToToken] = await Promise.all([
        fetchTokenDetails(tokenWithoutMode),
        fetchToToken(tokenWithoutMode),
      ]);
      setFromToken(token);
      setTokenLimits({
        minPerTx: defaultMinPerTx(isxDaiChain(token.chainId), token.decimals),
        maxPerTx: defaultMaxPerTx(token.decimals),
        dailyLimit: defaultDailyLimit(token.decimals),
      });
      if (token.chainId === providerChainId) {
        fetchTokenLimits(token, ethersProvider).then(limits => {
          setTokenLimits(limits);
        });
      }
      setToToken(gotToToken);
      setLoading(false);
    },
    [ethersProvider, providerChainId],
  );

  const approve = useCallback(async () => {
    setLoading(true);
    try {
      const approvalAmount =
        window.localStorage.getItem('infinite-unlock') === 'true'
          ? LARGEST_UINT256
          : fromAmount;
      await approveToken(ethersProvider, fromToken, approvalAmount);
      setAllowance(approvalAmount);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error({ approveError: error });
    }
    setLoading(false);
  }, [fromAmount, fromToken, ethersProvider]);

  const transfer = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, numConfirms] = await transferTokens(
        ethersProvider,
        fromToken,
        receiver || account,
        fromAmount,
      );
      setTotalConfirms(numConfirms);
      setTxHash(tx.hash);
    } catch (error) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.error({ transferError: error });
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
    setTxHash();
    setDefaultToken(providerChainId);
  }, [providerChainId, setAmount, setDefaultToken]);

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
        setUpdateFromAllowance,
        receiver,
        setReceiver,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
