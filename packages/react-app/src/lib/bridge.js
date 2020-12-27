import { BigNumber, Contract } from 'ethers';

import { fetchConfirmations } from './amb';
import { getGasPrice } from './gasPrice';
import {
  defaultDailyLimit,
  defaultMaxPerTx,
  defaultMinPerTx,
  getBridgeNetwork,
  getMediatorAddress,
  isxDaiChain,
  logError,
} from './helpers';
import { getOverriddenToToken, isOverridden } from './overrides';
import { getEthersProvider } from './providers';
import { fetchTokenDetails } from './token';

const getToName = (fromName, fromxDai) => {
  if (fromxDai) {
    if (fromName.includes('xDai')) return fromName.slice(0, -8);
    return `${fromName} on Mainnet`;
  }
  if (fromName.includes('Mainnet')) return fromName.slice(0, -11);
  return `${fromName} on xDai`;
};

export const fetchToTokenDetails = async ({
  name: fromName,
  chainId: fromChainId,
  address: fromAddress,
}) => {
  const toChainId = getBridgeNetwork(fromChainId);
  const isxDai = isxDaiChain(fromChainId);
  if (isOverridden(fromAddress)) {
    return fetchTokenDetails(getOverriddenToToken(fromAddress, fromChainId));
  }
  const fromEthersProvider = getEthersProvider(fromChainId);
  const toEthersProvider = getEthersProvider(toChainId);
  const fromMediatorAddress = getMediatorAddress(fromChainId);
  const toMediatorAddress = getMediatorAddress(toChainId);
  const abi = [
    'function isRegisteredAsNativeToken(address) view returns (bool)',
    'function bridgedTokenAddress(address) view returns (address)',
    'function nativeTokenAddress(address) view returns (address)',
  ];
  const fromMediatorContract = new Contract(
    fromMediatorAddress,
    abi,
    fromEthersProvider,
  );
  const isNativeToken = await fromMediatorContract
    .isRegisteredAsNativeToken(fromAddress)
    .catch(contractError => logError({ contractError }));

  if (isNativeToken) {
    const toMediatorContract = new Contract(
      toMediatorAddress,
      abi,
      toEthersProvider,
    );

    const toAddress = await toMediatorContract
      .bridgedTokenAddress(fromAddress)
      .catch(contractError => logError({ contractError }));
    const toName = isxDai ? `${fromName} on Mainnet` : `${fromName} on xDai`;
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: 'erc677',
      mediator: toMediatorAddress,
    };
  }
  const toAddress = await fromMediatorContract
    .nativeTokenAddress(fromAddress)
    .catch(contractError => logError({ contractError }));
  const toName = getToName(fromName, isxDai);
  return {
    name: toName,
    chainId: toChainId,
    address: toAddress,
    mode: 'erc20',
    mediator: toMediatorAddress,
  };
};

export const fetchToAmount = async (
  isRewardAddress,
  feeType,
  fromToken,
  toToken,
  fromAmount,
) => {
  if (fromAmount <= 0 || !fromToken || !toToken) return BigNumber.from(0);
  if (isRewardAddress || isOverridden(fromToken.address)) {
    return fromAmount;
  }
  const isxDai = isxDaiChain(toToken.chainId);
  const xDaiChainId = isxDai ? toToken.chainId : fromToken.chainId;
  const tokenAddress = isxDai ? toToken.address : fromToken.address;
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = isxDai ? toToken.mediator : fromToken.mediator;
  const abi = [
    'function calculateFee(bytes32, address, uint256) view returns (uint256)',
  ];
  const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);

  try {
    const fee = await mediatorContract
      .calculateFee(feeType, tokenAddress, fromAmount)
      .catch(contractError => logError({ contractError }));
    return fromAmount.sub(fee);
  } catch (amountError) {
    logError({ amountError });
    return fromAmount;
  }
};

export const fetchToToken = async fromToken => {
  const toToken = await fetchToTokenDetails(
    fromToken,
  ).catch(tokenDetailsError => logError({ tokenDetailsError }));

  return {
    symbol: fromToken.symbol,
    decimals: fromToken.decimals,
    logoURI: '',
    ...toToken,
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

  const mediatorContract = new Contract(
    token.mediator,
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
      (await mediatorContract
        .isTokenRegistered(token.address)
        .catch(contractError => logError({ contractError })));
    if (isRegistered) {
      [minPerTx, maxPerTx, dailyLimit] = await Promise.all([
        mediatorContract.minPerTx(token.address),
        mediatorContract.maxPerTx(token.address),
        mediatorContract.dailyLimit(token.address),
      ]).catch(contractError => logError({ contractError }));
    }
  } catch (error) {
    logError({ tokenError: error });
  }
  return {
    minPerTx,
    maxPerTx,
    dailyLimit,
  };
};

export const relayTokens = async (ethersProvider, token, receiver, amount) => {
  const signer = ethersProvider.getSigner();
  const { chainId, mode, mediator, address } = token;
  const gasPrice = getGasPrice(chainId);
  switch (mode) {
    case 'erc677': {
      const abi = ['function transferAndCall(address, uint256, bytes)'];
      const tokenContract = new Contract(address, abi, signer);
      return tokenContract.transferAndCall(mediator, amount, receiver, {
        gasPrice,
      });
    }
    case 'dedicated-erc20': {
      const abi = ['function relayTokens(address, uint256)'];
      const mediatorContract = new Contract(mediator, abi, signer);
      return mediatorContract.relayTokens(receiver, amount, { gasPrice });
    }
    case 'erc20':
    default: {
      const abi = ['function relayTokens(address, address, uint256)'];
      const mediatorContract = new Contract(mediator, abi, signer);
      return mediatorContract.relayTokens(token.address, receiver, amount, {
        gasPrice,
      });
    }
  }
};

export const transferTokens = async (
  ethersProvider,
  token,
  receiver,
  amount,
) => {
  const confirmsPromise = fetchConfirmations(token.chainId, ethersProvider);
  const txPromise = relayTokens(ethersProvider, token, receiver, amount);
  const [tx, confirms] = await Promise.all([
    txPromise,
    confirmsPromise,
  ]).catch(contractError => logError({ contractError }));

  return [tx, parseInt(confirms, 10)];
};
