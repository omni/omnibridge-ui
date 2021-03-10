import { logError } from './helpers';

export const addTokenToMetamask = async token => {
  try {
    const wasAdded = await window.ethereum.request({
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

    return wasAdded;
  } catch (metamaskError) {
    logError({ metamaskError });
    return false;
  }
};
