import { abis } from '@project/contracts';
import ethers from 'ethers';

import { getMediatorAddress } from './helpers';
import { getEthersProvider } from './providers';

export const fetchAllowance = (chainId, account, tokenAddress) => {
  if (!account) return 0;
  const ethersProvider = getEthersProvider(chainId);
  const tokenContract = new ethers.Contract(
    tokenAddress,
    abis.erc20,
    ethersProvider,
  );
  try {
    const mediatorAddress = getMediatorAddress(chainId);
    return tokenContract.allowance(account, mediatorAddress);
  } catch (error) {
    // eslint-disable-next-line
    console.log({ tokenError: error });
    return 0;
  }
};

export const approveToken = async (ethersProvider, token, amount) => {
  const tokenContract = new ethers.Contract(
    token.address,
    abis.erc20,
    ethersProvider.getSigner(),
  );
  const mediatorAddress = getMediatorAddress(token.chainId);
  const tx = await tokenContract.approve(mediatorAddress, amount);
  return tx.wait();
};

export const transferAndCallToken = async (ethersProvider, token, amount) => {
  const tokenContract = new ethers.Contract(
    token.address,
    abis.xdaiToken,
    ethersProvider.getSigner(),
  );
  const mediatorAddress = getMediatorAddress(token.chainId);
  const tx = await tokenContract.transferAndCall(mediatorAddress, amount, '0x');
  return tx;
};
