import ethers from 'ethers';

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
