import ethers from 'ethers';

import { ADDRESS_ZERO } from './constants';
import {
  getAMBAddress,
  getBridgeNetwork,
  getMediatorAddress,
  isxDaiChain,
} from './helpers';
import { getEthersProvider } from './providers';
import { transferAndCallToken } from './token';

export const fetchBridgedTokenAddress = async (fromChainId, tokenAddress) => {
  const isxDai = isxDaiChain(fromChainId);
  const xDaiChainId = isxDai ? fromChainId : getBridgeNetwork(fromChainId);
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(xDaiChainId);
  const abi = [
    'function foreignTokenAddress(address) view returns (address)',
    'function homeTokenAddress(address) view returns (address)',
  ];
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    abi,
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
  const abi = [
    'function FOREIGN_TO_HOME_FEE() view returns (uint256)',
    'function HOME_TO_FOREIGN_FEE() view returns (uint256)',
    'function calculateFee(bytes32, address, uint256) view returns (uint256)',
  ];
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    abi,
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

export const fetchToToken = async (fromToken, account) => {
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
  toToken.balance = await fetchTokenBalance(toToken, account);
  return toToken;
};

export const fetchTokenDetails = async (token, account) => {
  const ethersProvider = getEthersProvider(token.chainId);
  const tokenAbi = ['function balanceOf(address) view returns (uint256)'];
  const tokenContract = new ethers.Contract(
    token.address,
    tokenAbi,
    ethersProvider,
  );
  const mediatorAbi = [
    'function isTokenRegistered(address) view returns (bool)',
    'function minPerTx(address) view returns (uint256)',
    'function maxPerTx(address) view returns (uint256)',
    'function dailyLimit(address) view returns (uint256)',
  ];
  const mediatorAddress = getMediatorAddress(token.chainId);
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    mediatorAbi,
    ethersProvider,
  );
  let isRegistered = false;
  let balance = 0;
  const balanceInUsd = 0;
  let minPerTx = '1000000000000000000';
  let maxPerTx = '10000000000000000000000';
  let dailyLimit = '1000000000000000000000000';
  try {
    isRegistered = await mediatorContract.isTokenRegistered(token.address);
    if (account) {
      balance = await tokenContract.balanceOf(account);
    }
    if (isRegistered) {
      minPerTx = await mediatorContract.minPerTx(token.address);
      maxPerTx = await mediatorContract.maxPerTx(token.address);
      dailyLimit = await mediatorContract.dailyLimit(token.address);
    }
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return {
    ...token,
    isRegistered,
    balance,
    balanceInUsd,
    minPerTx,
    maxPerTx,
    dailyLimit,
  };
};

export const fetchTokenBalance = async (token, account) => {
  if (!account || !token || token.address === ADDRESS_ZERO) {
    return 0;
  }
  const ethersProvider = getEthersProvider(token.chainId);
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const tokenContract = new ethers.Contract(token.address, abi, ethersProvider);
  try {
    return await tokenContract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return 0;
};

export const fetchConfirmations = async chainId => {
  const ethersProvider = getEthersProvider(chainId);
  const abi = ['function requiredBlockConfirmations() view returns (uint256)'];
  const address = getAMBAddress(chainId);
  const ambContract = new ethers.Contract(address, abi, ethersProvider);
  return ambContract.requiredBlockConfirmations();
};

export const relayTokens = async (ethersProvider, token, amount) => {
  const mediatorAddress = getMediatorAddress(token.chainId);
  const abi = ['function relayTokens(address, uint256)'];
  const mediatorContract = new ethers.Contract(
    mediatorAddress,
    abi,
    ethersProvider.getSigner(),
  );

  return mediatorContract.relayTokens(token.address, amount);
};

export const transferTokens = async (ethersProvider, token, amount) => {
  const confirmsPromise = fetchConfirmations(token.chainId);
  const txPromise = isxDaiChain(token.chainId)
    ? transferAndCallToken(ethersProvider, token, amount)
    : relayTokens(ethersProvider, token, amount);
  const totalConfirms = parseInt(await confirmsPromise, 10);
  const tx = await txPromise;

  return [tx, totalConfirms];
};
