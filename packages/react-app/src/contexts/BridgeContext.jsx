import React, { useCallback, useContext, useState } from 'react';

import { useFeeType } from '../hooks/useFeeType';
import { useRewardAddress } from '../hooks/useRewardAddress';
import {
  fetchToAmount,
  fetchTokenLimits,
  fetchToToken,
  transferTokens,
} from '../lib/bridge';
import { LARGEST_UINT256 } from '../lib/constants';
import {
  defaultDailyLimit,
  defaultMaxPerTx,
  defaultMinPerTx,
  getDefaultToken,
  isxDaiChain,
  uniqueTokens,
} from '../lib/helpers';
import {
  approveToken,
  fetchAllowance,
  fetchTokenBalanceWithProvider,
  fetchTokenDetails,
} from '../lib/token';
import { fetchTokenList } from '../lib/tokenList';
import { Web3Context } from './Web3Context';

export const BridgeContext = React.createContext({});

export const BridgeProvider = ({ children }) => {
  const { ethersProvider, account, providerChainId } = useContext(Web3Context);
  const [fromToken, setFromToken] = useState();
  const [toToken, setToToken] = useState();
  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  const [toAmountLoading, setToAmountLoading] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState();
  const [totalConfirms, setTotalConfirms] = useState(0);
  const [tokenList, setTokenList] = useState([]);
  const [amountInput, setAmountInput] = useState('');
  const [fromBalance, setFromBalance] = useState();
  const [toBalance, setToBalance] = useState();
  const [tokenLimits, setTokenLimits] = useState();

  const isRewardAddress = useRewardAddress();
  const { homeToForeignFeeType, foreignToHomeFeeType } = useFeeType();

  const setAmount = useCallback(
    amount => {
      setFromAmount(amount);
      setToAmountLoading(true);
      const isxDai = isxDaiChain(toToken.chainId);
      const feeType = isxDai ? foreignToHomeFeeType : homeToForeignFeeType;
      fetchToAmount(isRewardAddress, feeType, fromToken, toToken, amount).then(
        gotToAmount => {
          setToAmount(gotToAmount);
          setToAmountLoading(false);
        },
      );
      if (fromToken.mode === 'erc677') {
        setAllowed(true);
      } else {
        fetchAllowance(fromToken, account, ethersProvider).then(gotAllowance =>
          setAllowed(window.BigInt(gotAllowance) >= window.BigInt(amount)),
        );
      }
    },
    [
      account,
      fromToken,
      toToken,
      ethersProvider,
      isRewardAddress,
      homeToForeignFeeType,
      foreignToHomeFeeType,
    ],
  );

  const setToken = useCallback(
    async tokenWithoutMode => {
      setLoading(true);
      setFromToken();
      setToToken();
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

  const setDefaultToken = useCallback(
    chainId => {
      if (fromToken && toToken && toToken.chainId === chainId) {
        const token = { ...toToken };
        setToToken(fromToken);
        setFromToken(token);
      } else if (!fromToken || fromToken.chainId !== chainId) {
        setToken(getDefaultToken(chainId));
      }
    },
    [setToken, fromToken, toToken],
  );

  const approve = useCallback(async () => {
    setLoading(true);
    try {
      const approvalAmount =
        window.localStorage.getItem('infinite-unlock') === 'true'
          ? LARGEST_UINT256
          : fromAmount;
      await approveToken(ethersProvider, fromToken, approvalAmount);
      setAllowed(true);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log({ approveError: error });
    }
    setLoading(false);
  }, [fromAmount, fromToken, ethersProvider]);

  const transfer = useCallback(async () => {
    setLoading(true);
    try {
      const [tx, numConfirms] = await transferTokens(
        ethersProvider,
        fromToken,
        account,
        fromAmount,
      );
      setTotalConfirms(numConfirms);
      setTxHash(tx.hash);
    } catch (error) {
      setLoading(false);
      // eslint-disable-next-line no-console
      console.log({ transferError: error });
    }
  }, [fromToken, account, ethersProvider, fromAmount]);

  const setDefaultTokenList = useCallback(
    async (chainId, customTokens) => {
      if (!account || !ethersProvider) return;

      const networkMismatch =
        chainId !== (await ethersProvider.getNetwork()).chainId;
      if (networkMismatch) return;

      setLoading(true);
      try {
        const baseTokenList = await fetchTokenList(chainId);
        const customTokenList = uniqueTokens(
          baseTokenList.concat(
            customTokens.filter(token => token.chainId === chainId),
          ),
        );
        const tokenListWithBalance = await Promise.all(
          customTokenList.map(async token => ({
            ...token,
            balance: await fetchTokenBalanceWithProvider(
              ethersProvider,
              token,
              account,
            ),
          })),
        );
        const sortedTokenList = tokenListWithBalance.sort(function checkBalance(
          { balance: balanceA },
          { balance: balanceB },
        ) {
          return parseInt(
            window.BigInt(balanceB) - window.BigInt(balanceA),
            10,
          );
        });
        setTokenList(sortedTokenList);
      } catch (error) {
        // eslint-disable-next-line
        console.log({ fetchTokensError: error });
      }
      setLoading(false);
    },
    [account, ethersProvider],
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
        setToken,
        setDefaultToken,
        allowed,
        approve,
        transfer,
        loading,
        setLoading,
        txHash,
        totalConfirms,
        tokenList,
        setDefaultTokenList,
        amountInput,
        setAmountInput,
        fromBalance,
        setFromBalance,
        toBalance,
        setToBalance,
        tokenLimits,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};
