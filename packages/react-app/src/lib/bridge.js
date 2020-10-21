import { Contract } from 'ethers';

import { fetchConfirmations } from './amb';
import {
  defaultDailyLimit,
  defaultMaxPerTx,
  defaultMinPerTx,
  getBridgeNetwork,
  getMediatorAddress,
  isxDaiChain,
} from './helpers';
import { getOverriddenToToken, isOverridden } from './overrides';
import { getEthersProvider } from './providers';
import { transferAndCallToken } from './token';

export const fetchToTokenAddress = async (fromChainId, tokenAddress) => {
  if (isOverridden(tokenAddress)) {
    return getOverriddenToToken(tokenAddress, fromChainId);
  }
  const isxDai = isxDaiChain(fromChainId);
  const xDaiChainId = isxDai ? fromChainId : getBridgeNetwork(fromChainId);
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(tokenAddress, xDaiChainId);
  const abi = [
    'function foreignTokenAddress(address) view returns (address)',
    'function homeTokenAddress(address) view returns (address)',
  ];
  const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

  if (isxDai) {
    return mediatorContract.foreignTokenAddress(tokenAddress);
  }
  return mediatorContract.homeTokenAddress(tokenAddress);
};

export const fetchToAmount = async (fromToken, toToken, fromAmount) => {
  if (fromAmount <= 0 || !fromToken || !toToken) return 0;
  if (isOverridden(fromToken.address)) {
    return fromAmount;
  }
  const isxDai = isxDaiChain(toToken.chainId);
  const xDaiChainId = isxDai
    ? toToken.chainId
    : getBridgeNetwork(toToken.chainId);
  const tokenAddress = isxDai ? toToken.address : fromToken.address;
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(tokenAddress, xDaiChainId);
  const abi = [
    'function FOREIGN_TO_HOME_FEE() view returns (uint256)',
    'function HOME_TO_FOREIGN_FEE() view returns (uint256)',
    'function calculateFee(bytes32, address, uint256) view returns (uint256)',
  ];
  const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

  try {
    const feeType = isxDai
      ? await mediatorContract.FOREIGN_TO_HOME_FEE()
      : await mediatorContract.HOME_TO_FOREIGN_FEE();
    const fee = await mediatorContract.calculateFee(
      feeType,
      tokenAddress,
      fromAmount,
    );
    return window.BigInt(fromAmount) - window.BigInt(fee);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ amountError: error });
    return fromAmount;
  }
};

export const fetchToToken = async fromToken => {
  const toTokenAddress = await fetchToTokenAddress(
    fromToken.chainId,
    fromToken.address
  );

  const toChainId = getBridgeNetwork(fromToken.chainId);
  const isxDai = isxDaiChain(toChainId);
  return {
    name: isxDai ? `${fromToken.name} on xDai` : fromToken.name.slice(0, -8),
    address: toTokenAddress,
    symbol: fromToken.symbol,
    decimals: fromToken.decimals,
    chainId: toChainId,
    logoURI: '',
  };
};

export const fetchTokenLimits = async (token, walletProvider) => {
  const isOverriddenToken = isOverridden(token.address);
  const mediatorAbi = [
    'function isTokenRegistered(address) view returns (bool)',
    'function minPerTx(address) view returns (uint256)',
    'function maxPerTx(address) view returns (uint256)',
    'function dailyLimit(address) view returns (uint256)',
  ];
  const mediatorAddress = getMediatorAddress(token.address, token.chainId);

  const mediatorContract = new Contract(
    mediatorAddress,
    mediatorAbi,
    walletProvider,
  );
  const isxDai = isxDaiChain(token.chainId);
  let minPerTx = defaultMinPerTx(isxDai, token.decimals);
  let maxPerTx = defaultMaxPerTx(token.decimals);
  let dailyLimit = defaultDailyLimit(token.decimals);
  try {
    const isRegistered =
      isOverriddenToken ||
      (await mediatorContract.isTokenRegistered(token.address));
    if (isRegistered) {
      [minPerTx, maxPerTx, dailyLimit] = await Promise.all([
        mediatorContract.minPerTx(token.address),
        mediatorContract.maxPerTx(token.address),
        mediatorContract.dailyLimit(token.address),
      ]);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return {
    minPerTx,
    maxPerTx,
    dailyLimit,
  };
};

export const relayTokens = async (ethersProvider, token, amount) => {
  const mediatorAddress = getMediatorAddress(token.address, token.chainId);
  const abi = ['function relayTokens(address, uint256)'];
  const signer = ethersProvider.getSigner();
  const mediatorContract = new Contract(mediatorAddress, abi, signer);

  if (isOverridden(token.address)) {
    // TODO: remove this check when abis of both mediators are same.
    return mediatorContract.relayTokens(await signer.getAddress(), amount);
  }
  return mediatorContract.relayTokens(token.address, amount);
};

export const transferTokens = async (ethersProvider, token, amount) => {
  const confirmsPromise = fetchConfirmations(token.chainId, ethersProvider);
  const txPromise = isxDaiChain(token.chainId)
    ? transferAndCallToken(ethersProvider, token, amount)
    : relayTokens(ethersProvider, token, amount);
  const totalConfirms = parseInt(await confirmsPromise, 10);
  const tx = await txPromise;

  return [tx, totalConfirms];
};
