import { abis } from '@project/contracts';
import ethers from 'ethers';

import { ADDRESS_ZERO } from './constants';
import {
  getBridgeNetwork,
  getDefaultToken,
  getMediatorAddress,
  isxDaiChain,
} from './helpers';
import { getEthersProvider } from './providers';

export const fetchBridgedTokenAddress = async (fromChainId, tokenAddress) => {
  const isxDai = isxDaiChain(fromChainId);
  const xDaiChainId = isxDai ? fromChainId : getBridgeNetwork(fromChainId);
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(xDaiChainId);
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    abis.xdaiMediator,
    ethersProvider,
  );

  if (isxDai) {
    return mediatorContract.foreignTokenAddress(tokenAddress);
  }
  return mediatorContract.homeTokenAddress(tokenAddress);
};

export const fetchToAmount = async (fromToken, toToken, fromAmount) => {
  if (fromAmount * 1 === 0 || !fromToken || !toToken) return 0;
  const isxDai = isxDaiChain(toToken.chainId);
  const xDaiChainId = isxDai
    ? toToken.chainId
    : getBridgeNetwork(toToken.chainId);
  const tokenAddress = isxDai ? toToken.address : fromToken.address;
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(xDaiChainId);
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    abis.xdaiMediator,
    ethersProvider,
  );

  try {
    const feeType = isxDai
      ? await mediatorContract.FOREIGN_TO_HOME_FEE()
      : await mediatorContract.HOME_TO_FOREIGN_FEE();
    const fee = await mediatorContract.calculateFee(
      feeType,
      tokenAddress,
      fromAmount,
    );
    return (fromAmount - fee).toString();
  } catch (error) {
    // eslint-disable-next-line
    console.log({ amountError: error });
    return fromAmount;
  }
};
export const fetchBalance = async (chainId, account, tokenAddress) => {
  if (!account) {
    return 0;
  }
  const ethersProvider = getEthersProvider(chainId);
  const tokenContract = new ethers.Contract(
    tokenAddress,
    abis.erc20,
    ethersProvider,
  );
  try {
    return tokenContract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ balanceError: error });
    return 0;
  }
};

export const fetchToToken = async (account, fromToken) => {
  const toTokenAddress = await fetchBridgedTokenAddress(
    fromToken.chainId,
    fromToken.address,
  );

  const toChainId = getBridgeNetwork(fromToken.chainId);
  const isxDai = isxDaiChain(toChainId);
  const toToken = {
    name: isxDai ? `${fromToken.name} on xDai` : fromToken.name.slice(0, -8),
    address: toTokenAddress,
    symbol: fromToken.symbol,
    decimals: 18,
    chainId: toChainId,
    logoURI: '',
    balance: 0,
    balanceInUsd: 0,
  };

  if (toTokenAddress === ADDRESS_ZERO) {
    return toToken;
  }

  const ethersProvider = getEthersProvider(toChainId);
  const tokenContract = new ethers.Contract(
    toTokenAddress,
    abis.erc20,
    ethersProvider,
  );

  try {
    return {
      ...toToken,
      name: await tokenContract.name(),
      balance: account ? await tokenContract.balanceOf(account) : 0,
    };
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
    return toToken;
  }
};

export const fetchDefaultToken = async (account, chainId) => {
  const token = getDefaultToken(chainId);
  return {
    ...token,
    balance: await fetchBalance(chainId, account, token.address),
    balanceInUsd: 0,
  };
};
