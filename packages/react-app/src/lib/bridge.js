import { BigNumber, Contract } from 'ethers';
import { ADDRESS_ZERO, REVERSE_BRIDGE_ENABLED } from 'lib/constants';
import {
  getBridgeNetwork,
  getMediatorAddress,
  getNetworkLabel,
  isxDaiChain,
  logError,
} from 'lib/helpers';
import { getOverriddenToToken, isOverridden } from 'lib/overrides';
import { getEthersProvider } from 'lib/providers';
import { fetchTokenDetails, fetchTokenName } from 'lib/token';

const getToName = (fromName, toChainId, toAddress) => {
  if (toAddress === ADDRESS_ZERO) {
    return `${fromName} on ${getNetworkLabel(toChainId)}`;
  }
  return fetchTokenName({ chainId: toChainId, address: toAddress });
};

export const fetchToTokenAddress = async (
  isxDai,
  xDaiChainId,
  tokenAddress,
) => {
  const ethersProvider = getEthersProvider(xDaiChainId);
  const mediatorAddress = getMediatorAddress(xDaiChainId);
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

export const fetchToTokenDetails = async ({
  name: fromName,
  chainId: fromChainId,
  address: fromAddress,
}) => {
  const toChainId = getBridgeNetwork(fromChainId);

  if (isOverridden(fromAddress)) {
    return fetchTokenDetails({
      address: getOverriddenToToken(fromAddress, fromChainId),
      chainId: toChainId,
    });
  }

  const isxDai = isxDaiChain(fromChainId);
  const fromMediatorAddress = getMediatorAddress(fromChainId);
  const toMediatorAddress = getMediatorAddress(toChainId);

  if (!REVERSE_BRIDGE_ENABLED) {
    const toAddress = await fetchToTokenAddress(
      isxDai,
      isxDai ? fromChainId : toChainId,
      fromAddress,
    );
    const toName = await getToName(fromName, toChainId, toAddress);
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: isxDai ? 'erc20' : 'erc677',
      mediator: toMediatorAddress,
    };
  }

  const fromEthersProvider = getEthersProvider(fromChainId);
  const toEthersProvider = getEthersProvider(toChainId);
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

    const toName = await getToName(fromName, toChainId, toAddress);
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: 'erc677',
      mediator: toMediatorAddress,
    };
  }
  const toAddress = await fromMediatorContract.nativeTokenAddress(fromAddress);

  const toName = await getToName(fromName, toChainId, toAddress);
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
  if (fromAmount.lte(0) || !fromToken || !toToken) return BigNumber.from(0);
  if (isRewardAddress) {
    return fromAmount;
  }
  const isxDai = isxDaiChain(toToken.chainId);
  const xDaiChainId = isxDai ? toToken.chainId : fromToken.chainId;
  const tokenAddress = isxDai ? toToken.address : fromToken.address;
  const mediatorAddress = isxDai ? toToken.mediator : fromToken.mediator;
  if (mediatorAddress !== getMediatorAddress(xDaiChainId)) {
    return fromAmount;
  }

  try {
    const ethersProvider = getEthersProvider(xDaiChainId);
    const abi = [
      'function calculateFee(bytes32, address, uint256) view returns (uint256)',
    ];
    const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);
    const fee = await mediatorContract.calculateFee(
      feeType,
      tokenAddress,
      fromAmount,
    );
    return fromAmount.sub(fee);
  } catch (amountError) {
    logError({ amountError });
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

const getDefaultTokenLimits = async (
  decimals,
  mediatorContract,
  toMediatorContract,
) => {
  let [minPerTx, maxPerTx, dailyLimit] = await Promise.all([
    mediatorContract.minPerTx(ADDRESS_ZERO),
    toMediatorContract.executionMaxPerTx(ADDRESS_ZERO),
    mediatorContract.executionDailyLimit(ADDRESS_ZERO),
  ]);

  if (decimals < 18) {
    const factor = BigNumber.from(10).pow(18 - decimals);

    minPerTx = minPerTx.div(factor);
    maxPerTx = maxPerTx.div(factor);
    dailyLimit = dailyLimit.div(factor);

    if (minPerTx.eq(0)) {
      minPerTx = BigNumber.from(1);
      if (maxPerTx.lte(minPerTx)) {
        maxPerTx = BigNumber.from(100);
        if (dailyLimit.lte(maxPerTx)) {
          dailyLimit = BigNumber.from(10000);
        }
      }
    }
  } else {
    const factor = BigNumber.from(10).pow(decimals - 18);

    minPerTx = minPerTx.mul(factor);
    maxPerTx = maxPerTx.mul(factor);
    dailyLimit = dailyLimit.mul(factor);
  }

  return {
    minPerTx,
    maxPerTx,
    dailyLimit,
  };
};

export const fetchTokenLimits = async (
  ethersProvider,
  token,
  toToken,
  currentDay,
) => {
  const isDedicatedMediatorToken =
    token.mediator !== getMediatorAddress(token.chainId);
  const abi = isDedicatedMediatorToken
    ? [
        'function minPerTx() view returns (uint256)',
        'function executionMaxPerTx() view returns (uint256)',
        'function executionDailyLimit() view returns (uint256)',
        'function totalExecutedPerDay(uint256) view returns (uint256)',
      ]
    : [
        'function minPerTx(address) view returns (uint256)',
        'function executionMaxPerTx(address) view returns (uint256)',
        'function executionDailyLimit(address) view returns (uint256)',
        'function totalExecutedPerDay(address, uint256) view returns (uint256)',
      ];

  try {
    const mediatorContract = new Contract(token.mediator, abi, ethersProvider);
    const toMediatorContract = new Contract(
      toToken.mediator,
      abi,
      getEthersProvider(toToken.chainId),
    );

    if (toToken.address === ADDRESS_ZERO) {
      return getDefaultTokenLimits(
        token.decimals,
        mediatorContract,
        toMediatorContract,
      );
    }

    const [
      minPerTx,
      executionMaxPerTx,
      executionDailyLimit,
      totalExecutedPerDay,
    ] = isDedicatedMediatorToken
      ? await Promise.all([
          mediatorContract.minPerTx(),
          toMediatorContract.executionMaxPerTx(),
          mediatorContract.executionDailyLimit(),
          toMediatorContract.totalExecutedPerDay(currentDay),
        ])
      : await Promise.all([
          mediatorContract.minPerTx(token.address),
          toMediatorContract.executionMaxPerTx(toToken.address),
          mediatorContract.executionDailyLimit(token.address),
          toMediatorContract.totalExecutedPerDay(toToken.address, currentDay),
        ]);

    return {
      minPerTx,
      maxPerTx: executionMaxPerTx,
      dailyLimit: executionDailyLimit.sub(totalExecutedPerDay),
    };
  } catch (error) {
    logError({ tokenLimitsError: error });
    return {
      minPerTx: BigNumber.from(0),
      maxPerTx: BigNumber.from(0),
      dailyLimit: BigNumber.from(0),
    };
  }
};

export const relayTokens = async (ethersProvider, token, receiver, amount) => {
  const signer = ethersProvider.getSigner();
  const { mode, mediator, address } = token;
  switch (mode) {
    case 'erc677': {
      const abi = ['function transferAndCall(address, uint256, bytes)'];
      const tokenContract = new Contract(address, abi, signer);
      return tokenContract.transferAndCall(mediator, amount, receiver);
    }
    case 'dedicated-erc20': {
      const abi = ['function relayTokens(address, uint256)'];
      const mediatorContract = new Contract(mediator, abi, signer);
      return mediatorContract.relayTokens(receiver, amount);
    }
    case 'erc20':
    default: {
      const abi = ['function relayTokens(address, address, uint256)'];
      const mediatorContract = new Contract(mediator, abi, signer);
      return mediatorContract.relayTokens(token.address, receiver, amount);
    }
  }
};

export const transferTokens = async (
  ethersProvider,
  token,
  receiver,
  amount,
) => {
  return relayTokens(ethersProvider, token, receiver, amount);
};
