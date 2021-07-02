import { BigNumber, Contract } from 'ethers';
import { ADDRESS_ZERO, nativeCurrencies } from 'lib/constants';
import {
  delay,
  getHelperContract,
  getMediatorAddressWithoutOverride,
  getNetworkLabel,
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
  await delay(1000);
  return fromAmount;
};

export const fetchTokenLimits = async (
  bridgeDirection,
  ethersProvider,
  token,
  toToken,
  currentDay,
) => ({
  minPerTx: BigNumber.from(0),
  maxPerTx: BigNumber.from(0),
  dailyLimit: BigNumber.from(0),
});

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

export const swapETH2BSC = async (ethersProvider, token, amount) => {
  const signer = ethersProvider.getSigner();
  const abi = [
    'function swapETH2BSC(address , uint256) payable external notContract returns (bool)',
  ];
  const swapContract = new Contract(
    '0xD25d84B989bFaFC2C77aB1d4FA1a04FC0eea9D24',
    abi,
    signer,
  );
  return swapContract.swapETH2BSC(token.address, amount);
};
