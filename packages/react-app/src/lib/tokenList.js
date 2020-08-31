const XDAI_TOKENS_URL =
  'https://raw.githubusercontent.com/raid-guild/default-token-list/master/src/tokens/xdai.json';
const MAINNET_TOKENS_URL =
  'https://raw.githubusercontent.com/raid-guild/default-token-list/master/src/tokens/mainnet.json';
const KOVAN_TOKENS_URL =
  'https://raw.githubusercontent.com/raid-guild/default-token-list/master/src/tokens/kovan.json';
const SOKOL_TOKENS_URL =
  'https://raw.githubusercontent.com/raid-guild/default-token-list/master/src/tokens/sokol.json';

const getTokenListUrl = (chainId) => {
  switch (chainId) {
    case 100:
      return XDAI_TOKENS_URL;
    case 77:
      return SOKOL_TOKENS_URL;
    case 42:
      return KOVAN_TOKENS_URL;
    case 1:
    default:
      return MAINNET_TOKENS_URL;
  }
};

export const getTokenList = async (chainId) => {
  const url = getTokenListUrl(chainId);
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  throw new Error('TokenList not found');
};
