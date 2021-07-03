import { BigNumber, Contract } from 'ethers';
import { delay, getHelperContract } from 'lib/helpers';

import { defaultTokens, networks } from './networks';

const fetchToTokenDetails = async (bridgeDirection, fromToken, toChainId) => {
  const {
    homeChainId,
    foreignChainId,
    foreignMediatorAddress,
    homeMediatorAddress,
  } = networks[bridgeDirection];
  const isHome = fromToken.chainId === homeChainId;
  const { address } =
    defaultTokens[bridgeDirection][isHome ? homeChainId : foreignChainId];

  return {
    name: 'Mask Network',
    chainId: toChainId,
    address,
    mode: 'erc20',
    mediator: isHome ? homeMediatorAddress : foreignMediatorAddress,
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
