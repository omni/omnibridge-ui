import { utils } from 'ethers';

import {
  getExplorerUrl,
  getNetworkCurrency,
  getNetworkName,
  getRPCUrl,
} from './helpers';

export const addTokenToMetamask = async token =>
  window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
      },
    },
  });

export const addChainToMetaMask = async ethereumChain => {
  const { chainId } = ethereumChain;
  const { name, symbol } = getNetworkCurrency(chainId);
  return window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: utils.hexValue(chainId),
        chainName: getNetworkName(chainId),
        nativeCurrency: {
          name,
          symbol,
          decimals: 18,
        },
        rpcUrls: [getRPCUrl(chainId)],
        blockExplorerUrls: [getExplorerUrl(chainId)],
      },
    ],
  });
};
