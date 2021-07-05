import { utils } from 'ethers';
import {
  getExplorerUrl,
  getNetworkCurrency,
  getNetworkName,
  getRPCUrl,
  logError,
} from 'lib/helpers';

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

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: utils.hexValue(chainId),
        },
      ],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
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
      } catch (addError) {
        logError({ addError });
      }
    } else {
      logError({ switchError });
    }
  }
};
