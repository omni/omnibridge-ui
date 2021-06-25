import { BigNumber, Contract } from 'ethers';
import { ADDRESS_ZERO, nativeCurrencies } from 'lib/constants';
import {
  getHelperContract,
  getMediatorAddressWithoutOverride,
  getNetworkLabel,
  logError,
} from 'lib/helpers';
import { getOverriddenToToken, isOverridden } from 'lib/overrides';
import { getEthersProvider } from 'lib/providers';
import { fetchTokenDetails, fetchTokenName } from 'lib/token';

import { networks } from './networks';

const getToName = async (fromToken, toChainId, toAddress) => {
  const { name } = fromToken;
  if (toAddress === ADDRESS_ZERO) {
    const fromName = name || (await fetchTokenName(fromToken));
    return `${fromName} on ${getNetworkLabel(toChainId)}`;
  }
  return fetchTokenName({ chainId: toChainId, address: toAddress });
};

const fetchToTokenAddress = async (
  isHome,
  homeChainId,
  tokenAddress,
  homeMediatorAddress,
) => {
  const ethersProvider = await getEthersProvider(homeChainId);
  const abi = [
    'function foreignTokenAddress(address) view returns (address)',
    'function homeTokenAddress(address) view returns (address)',
  ];
  const mediatorContract = new Contract(
    homeMediatorAddress,
    abi,
    ethersProvider,
  );

  if (isHome) {
    return mediatorContract.foreignTokenAddress(tokenAddress);
  }
  return mediatorContract.homeTokenAddress(tokenAddress);
};

const fetchToTokenDetails = async (bridgeDirection, fromToken, toChainId) => {
  const {
    chainId: fromChainId,
    address: fromAddress,
    mode: fromMode,
  } = fromToken;
  if (
    isOverridden(bridgeDirection, {
      address: fromAddress,
      chainId: fromChainId,
    })
  ) {
    return fetchTokenDetails(bridgeDirection, {
      address: getOverriddenToToken(bridgeDirection, {
        address: fromAddress,
        chainId: fromChainId,
      }),
      chainId: toChainId,
    });
  }

  const { homeChainId, enableReversedBridge } = networks[bridgeDirection];

  const isHome = homeChainId === fromChainId;
  const fromMediatorAddress = getMediatorAddressWithoutOverride(
    bridgeDirection,
    fromChainId,
  );
  const toMediatorAddress = getMediatorAddressWithoutOverride(
    bridgeDirection,
    toChainId,
  );

  if (fromAddress === ADDRESS_ZERO && fromMode === 'NATIVE') {
    const { homeTokenAddress: toAddress } = nativeCurrencies[fromChainId];
    return fetchTokenDetails(bridgeDirection, {
      address: toAddress,
      chainId: toChainId,
    });
  }

  if (!enableReversedBridge) {
    const toAddress = await fetchToTokenAddress(
      isHome,
      homeChainId,
      fromAddress,
      isHome ? fromMediatorAddress : toMediatorAddress,
    );
    const toName = await getToName(fromToken, toChainId, toAddress);
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: isHome ? 'erc20' : 'erc677',
      mediator: toMediatorAddress,
    };
  }

  const fromEthersProvider = await getEthersProvider(fromChainId);
  const toEthersProvider = await getEthersProvider(toChainId);
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

    const toName = await getToName(fromToken, toChainId, toAddress);
    return {
      name: toName,
      chainId: toChainId,
      address: toAddress,
      mode: 'erc677',
      mediator: toMediatorAddress,
    };
  }
  const toAddress = await fromMediatorContract.nativeTokenAddress(fromAddress);

  const toName = await getToName(fromToken, toChainId, toAddress);
  return {
    name: toName,
    chainId: toChainId,
    address: toAddress,
    mode: 'erc20',
    mediator: toMediatorAddress,
  };
};

export const fetchToToken = async (bridgeDirection, fromToken, toChainId) => {
  const toToken = await fetchToTokenDetails(
    bridgeDirection,
    fromToken,
    toChainId,
  );
  return toToken;
};

export const fetchToAmount = async (
  bridgeDirection,
  feeType,
  fromToken,
  toToken,
  fromAmount,
  feeManagerAddress,
) => {
  if (fromAmount.lte(0) || !fromToken || !toToken) return BigNumber.from(0);
  const { homeChainId, homeMediatorAddress } = networks[bridgeDirection];

  const isHome = homeChainId === toToken.chainId;
  const tokenAddress = isHome ? toToken.address : fromToken.address;
  const mediatorAddress = isHome ? toToken.mediator : fromToken.mediator;
  if (mediatorAddress !== homeMediatorAddress) {
    return fromAmount;
  }

  try {
    const ethersProvider = await getEthersProvider(homeChainId);
    const abi = [
      'function calculateFee(bytes32, address, uint256) view returns (uint256)',
    ];
    const feeManagerContract = new Contract(
      feeManagerAddress,
      abi,
      ethersProvider,
    );
    const fee = await feeManagerContract.calculateFee(
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
  bridgeDirection,
  ethersProvider,
  token,
  toToken,
  currentDay,
) => {
  const isDedicatedMediatorToken =
    token.mediator !==
    getMediatorAddressWithoutOverride(bridgeDirection, token.chainId);

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
      await getEthersProvider(toToken.chainId),
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

export const relayTokens = async (
  ethersProvider,
  token,
  receiver,
  amount,
  { shouldReceiveNativeCur, foreignChainId },
) => {
  const signer = ethersProvider.getSigner();
  const { mode, mediator, address, helperContractAddress } = token;
  switch (mode) {
    case 'NATIVE': {
      const abi = [
        'function wrapAndRelayTokens(address _receiver) public payable',
      ];
      const helperContract = new Contract(helperContractAddress, abi, signer);
      return helperContract.wrapAndRelayTokens(receiver, { value: amount });
    }
    case 'erc677': {
      const abi = ['function transferAndCall(address, uint256, bytes)'];
      const tokenContract = new Contract(address, abi, signer);
      const bytesData = shouldReceiveNativeCur
        ? `${getHelperContract(foreignChainId)}${receiver.replace('0x', '')}`
        : receiver;
      return tokenContract.transferAndCall(mediator, amount, bytesData);
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
