import { BigNumber, Contract } from 'ethers';

import { ADDRESS_ZERO } from './constants';
import { getMediatorAddress } from './helpers';
import {
  getOverriddenMediator,
  getOverriddenMode,
  isOverridden,
} from './overrides';
import { getEthersProvider } from './providers';

export const fetchAllowance = (
  { mediator, address },
  account,
  walletProvider,
) => {
  if (!account) return BigNumber.from(0);

  const abi = ['function allowance(address, address) view returns (uint256)'];
  const tokenContract = new Contract(address, abi, walletProvider);
  try {
    return tokenContract.allowance(account, mediator);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return BigNumber.from(0);
};

export const getMode = async (
  ethersProvider,
  isOverriddenToken,
  mediatorAddress,
  token,
) => {
  if (isOverriddenToken) {
    return getOverriddenMode(token.address, token.chainId);
  }
  const abi = ['function nativeTokenAddress(address) view returns (address)'];
  const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);
  const nativeTokenAddress = await mediatorContract.nativeTokenAddress(
    token.address,
  );
  if (nativeTokenAddress === ADDRESS_ZERO) return 'erc20';
  return 'erc677';
};

export const fetchTokenDetails = async token => {
  const ethersProvider = getEthersProvider(token.chainId);
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ];
  const tokenContract = new Contract(token.address, abi, ethersProvider);
  const isOverriddenToken = isOverridden(token.address);

  const mediatorAddress = isOverriddenToken
    ? getOverriddenMediator(token.address, token.chainId)
    : getMediatorAddress(token.chainId);

  const [name, symbol, decimals, mode] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
    getMode(ethersProvider, isOverriddenToken, mediatorAddress, token),
  ]);

  const details = {
    address: token.address,
    chainId: token.chainId,
    name,
    symbol,
    decimals: Number(decimals),
    mode,
    mediator: mediatorAddress,
  };
  return details;
};

export const approveToken = async (ethersProvider, token, amount) => {
  const abi = ['function approve(address, uint256)'];
  const tokenContract = new Contract(
    token.address,
    abi,
    ethersProvider.getSigner(),
  );
  const mediatorAddress = getMediatorAddress(token.address, token.chainId);
  const tx = await tokenContract.approve(mediatorAddress, amount);
  return tx.wait();
};

export const fetchTokenBalance = async (token, account) => {
  const ethersProvider = getEthersProvider(token.chainId);
  return fetchTokenBalanceWithProvider(ethersProvider, token, account);
};

export const fetchTokenBalanceWithProvider = async (
  ethersProvider,
  token,
  account,
) => {
  if (!account || !token || token.address === ADDRESS_ZERO || !ethersProvider) {
    // eslint-disable-next-line no-console
    console.log({ balanceError: 'Returning balance as 0', account, token });
    return BigNumber.from(0);
  }
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const tokenContract = new Contract(token.address, abi, ethersProvider);
  try {
    return tokenContract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return BigNumber.from(0);
};
