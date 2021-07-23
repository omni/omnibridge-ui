import { utils } from 'ethers';
import {
  getExplorerUrl,
  getNetworkCurrency,
  getNetworkName,
  getRPCUrl,
  logError,
} from 'lib/helpers';

export const addTokenToMetamask = async ({ address, symbol, decimals }) =>
  window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address,
        symbol,
        decimals,
      },
    },
  });

const trySwitchChain = async chainId =>
  window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [
      {
        chainId: utils.hexValue(chainId),
      },
    ],
  });

const tryAddChain = async (chainId, currency) =>
  window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: utils.hexValue(chainId),
        chainName: getNetworkName(chainId),
        nativeCurrency: currency,
        rpcUrls: [getRPCUrl(chainId)],
        blockExplorerUrls: [getExplorerUrl(chainId)],
      },
    ],
  });

export const addChainToMetaMask = async chainId => {
  const { name, symbol } = getNetworkCurrency(chainId);
  const currency = { name, symbol, decimals: 18 };

  const add = ![1, 3, 4, 5, 42].includes(chainId);
  if (add) {
    try {
      await tryAddChain(chainId, currency);
      return true;
    } catch (addError) {
      logError({ addError });
    }
    return false;
  }

  try {
    await trySwitchChain(chainId);
    return true;
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await tryAddChain(chainId, currency);
        return true;
      } catch (addError) {
        logError({ addError });
      }
    } else {
      logError({ switchError });
    }
  }
  return false;
};
