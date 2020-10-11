import ethers from 'ethers';

import { ADDRESS_ZERO } from './constants';
import { getMediatorAddress } from './helpers';
import { getEthersProvider } from './providers';

export const fetchAllowance = (chainId, account, tokenAddress) => {
  if (!account) return 0;
  const ethersProvider = getEthersProvider(chainId);
  const abi = ['function allowance(address, address) view returns (uint256)'];
  const tokenContract = new ethers.Contract(tokenAddress, abi, ethersProvider);
  try {
    const mediatorAddress = getMediatorAddress(tokenAddress, chainId);
    return tokenContract.allowance(account, mediatorAddress);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
    return 0;
  }
};

export const fetchTokenDetails = async (chainId, tokenAddress) => {
  const ethersProvider = getEthersProvider(chainId);
  const abi = [
    'function decimals() view returns (uint8)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
  ];
  const tokenContract = new ethers.Contract(tokenAddress, abi, ethersProvider);

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.name(),
    tokenContract.symbol(),
    tokenContract.decimals(),
  ]);
  const details = {
    address: tokenAddress,
    chainId,
    name,
    symbol,
    decimals: Number(decimals),
  };
  return details;
};

export const approveToken = async (ethersProvider, token, amount) => {
  const abi = ['function approve(address, uint256)'];
  const tokenContract = new ethers.Contract(
    token.address,
    abi,
    ethersProvider.getSigner(),
  );
  const mediatorAddress = getMediatorAddress(token.address, token.chainId);
  const tx = await tokenContract.approve(mediatorAddress, amount);
  return tx.wait();
};

export const transferAndCallToken = async (ethersProvider, token, amount) => {
  const abi = ['function transferAndCall(address, uint256, bytes)'];
  const tokenContract = new ethers.Contract(
    token.address,
    abi,
    ethersProvider.getSigner(),
  );
  const mediatorAddress = getMediatorAddress(token.address, token.chainId);
  return tokenContract.transferAndCall(mediatorAddress, amount, '0x');
};

export const fetchTokenBalance = async (token, account) => {
  if (!account || !token || token.address === ADDRESS_ZERO) {
    // eslint-disable-next-line
    console.log({ balanceError: 'Returning balance as 0', account, token });
    return 0;
  }
  const ethersProvider = getEthersProvider(token.chainId);
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const tokenContract = new ethers.Contract(token.address, abi, ethersProvider);
  try {
    return tokenContract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return 0;
};

export const fetchTokenBalanceWithProvider = async (
  ethersProvider,
  token,
  account,
) => {
  if (!account || !token || token.address === ADDRESS_ZERO || !ethersProvider) {
    // eslint-disable-next-line
    console.log({ balanceError: 'Returning balance as 0', account, token });
    return 0;
  }
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const tokenContract = new ethers.Contract(token.address, abi, ethersProvider);
  try {
    return tokenContract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
  }
  return 0;
};
