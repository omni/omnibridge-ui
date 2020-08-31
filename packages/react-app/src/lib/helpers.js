import ethers from 'ethers';

import { defaultTokens } from '../constants';

export const fetchBalance = async (ethersProvider, account, erc20Address) => {
  if (!ethersProvider || !account) {
    return 0;
  }
  try {
    const abi = ['function balanceOf(address owner) view returns (uint256)'];
    const contract = new ethers.Contract(erc20Address, abi, ethersProvider);
    return await contract.balanceOf(account);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ balanceError: error });
    return 0;
  }
};

/* TODO calculate toAmount based on fromAmount
 * and toToken which holds chainId as well */
export const fetchToAmount = async (toToken, fromAmount) => {
  return fromAmount;
};

/* TODO calculate toToken based on fromToken.
 * This will need ethersProvider or creating a new ethersProvider.
 * Also need to fetch balance for new token as well. */
export const fetchToToken = async (fromToken) => {
  return fromToken;
};

export const fetchDefaultToken = async (ethersProvider, account, chainId) => {
  const token = defaultTokens[chainId];
  if (
    ethersProvider &&
    (await ethersProvider.getNetwork()).chainId === chainId
  ) {
    token.balance = await fetchBalance(ethersProvider, account, token.address);
  } else {
    token.balance = 0;
  }
  token.balanceInUsd = 0;
  return token;
};
