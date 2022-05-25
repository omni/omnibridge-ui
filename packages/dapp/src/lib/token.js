import { BigNumber, Contract, utils } from 'ethers';

import { ADDRESS_ZERO } from './constants';
import {
  getMediatorAddress,
  getMediatorAddressWithoutOverride,
  logError,
} from './helpers';
import { getOverriddenMode, isOverridden } from './overrides';
import { getEthersProvider } from './providers';

export const fetchAllowance = async (
  { mediator, address },
  account,
  ethersProvider,
) => {
  if (
    !account ||
    !address ||
    address === ADDRESS_ZERO ||
    !mediator ||
    mediator === ADDRESS_ZERO ||
    !ethersProvider
  ) {
    return BigNumber.from(0);
  }

  try {
    const abi = ['function allowance(address, address) view returns (uint256)'];
    const tokenContract = new Contract(address, abi, ethersProvider);
    return tokenContract.allowance(account, mediator);
  } catch (allowanceError) {
    logError({ allowanceError });
  }
  return BigNumber.from(0);
};

const fetchMode = async (bridgeDirection, token) => {
  if (isOverridden(bridgeDirection, token)) {
    return getOverriddenMode(bridgeDirection, token);
  }

  const ethersProvider = await getEthersProvider(token.chainId);
  const mediatorAddress = getMediatorAddressWithoutOverride(
    bridgeDirection,
    token.chainId,
  );
  const abi = ['function nativeTokenAddress(address) view returns (address)'];
  const mediatorContract = new Contract(mediatorAddress, abi, ethersProvider);
  const nativeTokenAddress = await mediatorContract.nativeTokenAddress(
    token.address,
  );
  if (nativeTokenAddress === ADDRESS_ZERO) return 'erc20';
  return 'erc677';
};

export const renamexDaiTokensAsGnosis = tokenName => {
  if (!tokenName) return tokenName;
  if (tokenName.includes('on xDai'))
    return tokenName.replace('on xDai', 'on GC');
  if (tokenName.includes('from xDai'))
    return tokenName.replace('from xDai', 'from GC');
  return tokenName;
};

export const fetchTokenName = async token => {
  const ethersProvider = await getEthersProvider(token.chainId);

  let tokenName = token.name || '';
  try {
    const stringAbi = ['function name() view returns (string)'];
    const tokenContractString = new Contract(
      token.address,
      stringAbi,
      ethersProvider,
    );
    tokenName = await tokenContractString.name();
  } catch {
    const bytes32Abi = ['function name() view returns (bytes32)'];
    const tokenContractBytes32 = new Contract(
      token.address,
      bytes32Abi,
      ethersProvider,
    );
    tokenName = utils.parseBytes32String(await tokenContractBytes32.name());
  }
  return renamexDaiTokensAsGnosis(tokenName);
};

const fetchTokenDetailsBytes32 = async token => {
  const ethersProvider = await getEthersProvider(token.chainId);
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (bytes32)',
    'function name() view returns (bytes32)',
  ];
  const tokenContract = new Contract(token.address, abi, ethersProvider);
  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
  ]);
  return {
    name: utils.parseBytes32String(name),
    symbol: utils.parseBytes32String(symbol),
    decimals,
  };
};

const fetchTokenDetailsString = async token => {
  const ethersProvider = await getEthersProvider(token.chainId);
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ];
  const tokenContract = new Contract(token.address, abi, ethersProvider);

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
  ]);

  return { name, symbol, decimals };
};

const fetchTokenDetailsFromContract = async token => {
  let details = {};
  try {
    details = await fetchTokenDetailsString(token);
  } catch {
    details = await fetchTokenDetailsBytes32(token);
  }
  return details;
};

export const fetchTokenDetails = async (bridgeDirection, token) => {
  const mediatorAddress = getMediatorAddress(bridgeDirection, token);
  const [{ name, symbol, decimals }, mode] = await Promise.all([
    fetchTokenDetailsFromContract(token),
    fetchMode(bridgeDirection, token),
  ]);

  // replace xDai in token names with GC

  return {
    ...token,
    name: renamexDaiTokensAsGnosis(name),
    symbol,
    decimals: Number(decimals),
    mode,
    mediator: mediatorAddress,
  };
};

export const approveToken = async (
  ethersProvider,
  { address, mediator },
  amount,
) => {
  const abi = ['function approve(address, uint256)'];
  const tokenContract = new Contract(address, abi, ethersProvider.getSigner());
  return tokenContract.approve(mediator, amount);
};

export const fetchTokenBalance = async (token, account) => {
  const ethersProvider = await getEthersProvider(token.chainId);
  return fetchTokenBalanceWithProvider(ethersProvider, token, account);
};

export const fetchTokenBalanceWithProvider = async (
  ethersProvider,
  { address, mode, symbol },
  account,
) => {
  if (address === ADDRESS_ZERO && mode === 'NATIVE') {
    return ethersProvider.getBalance(account);
  }
  if (!account || !address || address === ADDRESS_ZERO || !ethersProvider) {
    return BigNumber.from(0);
  }
  try {
    const abi = ['function balanceOf(address) view returns (uint256)'];
    const tokenContract = new Contract(address, abi, ethersProvider);
    const balance = await tokenContract.balanceOf(account);
    return balance;
  } catch (error) {
    logError(`Error fetching balance for ${address}-${symbol}`, error);
  }

  return BigNumber.from(0);
};
