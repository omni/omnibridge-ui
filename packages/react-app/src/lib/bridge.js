import { BigNumber, Contract } from 'ethers';

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
import { fetchTokenDetails } from './token';

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
  const isNativeToken = await fromMediatorContract.isRegisteredAsNativeToken(
    fromAddress,
  );

  if (isNativeToken) {
    const toMediatorContract = new Contract(
      toMediatorAddress,
      abi,
      toEthersProvider,
    );

    const toAddress = await toMediatorContract.bridgedTokenAddress(fromAddress);
    const toName = isxDai ? `${fromName} on Mainnet` : `${fromName} on xDai`;
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: 'erc677',
      mediator: toMediatorAddress,
    };
  }
  const toAddress = await fromMediatorContract.nativeTokenAddress(fromAddress);
  const toName = isxDai ? fromName.slice(0, -8) : fromName.slice(0, -11);
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
    const fee = await mediatorContract.calculateFee(
      feeType,
      tokenAddress,
      fromAmount,
    );
    return fromAmount.sub(fee);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ amountError: error });
    return fromAmount;
  }
};

export const fetchToToken = async fromToken => {
  const toToken = await fetchToTokenDetails(fromToken);

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

export const relayTokens = async (ethersProvider, token, receiver, amount) => {
  const abi = [
    'function relayTokens(address, uint256)',
    'function transferAndCall(address, uint256, bytes)',
  ];
  const signer = ethersProvider.getSigner();
  const { mode, mediator, address } = token;
  const mediatorContract = new Contract(mediator, abi, signer);
  const tokenContract = new Contract(address, abi, ethersProvider.getSigner());
  switch (mode) {
    case 'erc677':
      return tokenContract.transferAndCall(mediator, amount, '0x');
    case 'dedicated-erc20':
      return mediatorContract.relayTokens(receiver, amount);
    case 'erc20':
    default:
      return mediatorContract.relayTokens(token.address, amount);
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
  const [tx, confirms] = await Promise.all([txPromise, confirmsPromise]);

  return [tx, parseInt(confirms, 10)];
};
