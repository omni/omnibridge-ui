import { BigNumber, Contract } from 'ethers';
import { delay } from 'lib/helpers';

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
    defaultTokens[bridgeDirection][isHome ? foreignChainId : homeChainId];

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
  bridgeDirection,
  token,
  receiver,
  amount,
  { shouldReceiveNativeCur, foreignChainId },
) => {
  const signer = ethersProvider.getSigner();
  const { homeChainId } = networks[bridgeDirection];
  const isHome = token.chainId === homeChainId;

  const abi = [
    'function swapFee() view returns (uint256)',
    'function swapBSC2ETH(address erc20Addr, uint256 amount) public payable returns (bool)',
    'function swapETH2BSC(address erc20Addr, uint256 amount) public payable returns (bool)',
  ];
  const mediatorContract = new Contract(token.mediator, abi, signer);
  const overrides = {
    from: receiver,
    value: await mediatorContract.swapFee(),
  };

  console.log('DEBUG: relay tokens')
  console.log({
    isHome,
    amount,
    token,
    receiver,
    overrides,
  })

  return mediatorContract[isHome ? 'swapBSC2ETH' : 'swapETH2BSC'](token.address, amount, overrides);
};
