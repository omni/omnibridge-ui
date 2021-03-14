import { utils } from 'ethers';

import { getNetworkName, getRPCUrl } from './helpers';

export const addTokenToMetamask = async token => {
  return window.ethereum.request({
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
};

export const addChainToMetaMask = async ethereumChain => {
  const { chainId } = ethereumChain;
  return window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: utils.hexValue(chainId),
        chainName: getNetworkName(chainId),
        nativeCurrency: {
          name: 'SOME',
          symbol: 'BODY',
          decimals: 18,
        },
        rpcUrls: [getRPCUrl(chainId)],
      },
    ],
  });
};
