import {
  BSC_XDAI_BRIDGE,
  ETH_XDAI_BRIDGE,
  nativeCurrencies,
  GOERLI_XDAI_BRIDGE,
} from 'lib/constants';

export {
  BSC_XDAI_BRIDGE,
  ETH_XDAI_BRIDGE,
  GOERLI_XDAI_BRIDGE,
};

const ETH_XDAI_BRIDGE_CONFIG = {
  label: 'eth⥊gc',
  homeChainId: 100,
  foreignChainId: 1,
  enableForeignCurrencyBridge: true,
  homeWrappedForeignCurrencyAddress:
    '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1'.toLowerCase(),
  wrappedForeignCurrencyAddress:
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase(),
  foreignMediatorAddress:
    '0x88ad09518695c6c3712AC10a214bE5109a655671'.toLowerCase(),
  homeMediatorAddress:
    '0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d'.toLowerCase(),
  foreignAmbAddress: '0x4C36d2919e407f0Cc2Ee3c993ccF8ac26d9CE64e'.toLowerCase(),
  homeAmbAddress: '0x75Df5AF045d91108662D8080fD1FEFAd6aA0bb59'.toLowerCase(),
  foreignGraphName: 'raid-guild/mainnet-omnibridge',
  homeGraphName: 'raid-guild/xdai-omnibridge',
  ambLiveMonitorPrefix: 'https://alm-bridge-monitor.gnosischain.com',
  claimDisabled: false,
  tokensClaimDisabled: [],
};

const BSC_XDAI_BRIDGE_CONFIG = {
  label: 'bsc⥊gc',
  homeChainId: 100,
  foreignChainId: 56,
  enableForeignCurrencyBridge: true,
  homeWrappedForeignCurrencyAddress:
    '0xCa8d20f3e0144a72C6B5d576e9Bd3Fd8557E2B04'.toLowerCase(),
  wrappedForeignCurrencyAddress:
    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'.toLowerCase(),
  foreignMediatorAddress:
    '0xF0b456250DC9990662a6F25808cC74A6d1131Ea9'.toLowerCase(),
  homeMediatorAddress:
    '0x59447362798334d3485c64D1e4870Fde2DDC0d75'.toLowerCase(),
  foreignAmbAddress: '0x05185872898b6f94AA600177EF41B9334B1FA48B'.toLowerCase(),
  homeAmbAddress: '0x162E898bD0aacB578C8D5F8d6ca588c13d2A383F'.toLowerCase(),
  foreignGraphName: 'dan13ram/bsc-to-xdai-omnibridge',
  homeGraphName: 'dan13ram/xdai-to-bsc-omnibridge',
  ambLiveMonitorPrefix: 'https://alm-bridge-monitor.gnosischain.com',
  claimDisabled: false,
  tokensClaimDisabled: [
    '0xCa8d20f3e0144a72C6B5d576e9Bd3Fd8557E2B04'.toLowerCase(), // Wrapped BNB from BSC
  ],
};

const GOERLI_XDAI_BRIDGE_CONFIG = {
  label: 'gör⥊gc',
  homeChainId: 10200,
  foreignChainId: 5,
  enableForeignCurrencyBridge: true,
  homeWrappedForeignCurrencyAddress:
    ''.toLowerCase(),
  wrappedForeignCurrencyAddress:
    ''.toLowerCase(),
  foreignMediatorAddress:
    ''.toLowerCase(),
  homeMediatorAddress:
    ''.toLowerCase(),
  foreignAmbAddress: ''.toLowerCase(),
  homeAmbAddress: ''.toLowerCase(),
  foreignGraphName: '',
  homeGraphName: '',
  ambLiveMonitorPrefix: '',
  claimDisabled: false,
  tokensClaimDisabled: [],
};

const ENABLED_BRIDGES = process.env.REACT_APP_ENABLED_BRIDGES.split(' ').map(
  b => b.toLowerCase(),
);

const bridgeInfo = {
  [ETH_XDAI_BRIDGE]: ETH_XDAI_BRIDGE_CONFIG,
  [BSC_XDAI_BRIDGE]: BSC_XDAI_BRIDGE_CONFIG,
  [GOERLI_XDAI_BRIDGE]: GOERLI_XDAI_BRIDGE_CONFIG,
};

const getNetworkConfig = bridges => {
  if (bridges && bridges.length > 0 && bridgeInfo) {
    return bridges.reduce((t, b) => ({ ...t, [b]: bridgeInfo[b] }), {});
  }
  return bridgeInfo;
};

export const networks = getNetworkConfig(ENABLED_BRIDGES);

export const defaultTokens = {
  [ETH_XDAI_BRIDGE]: {
    1: {
      address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
      chainId: 1,
      symbol: 'GNO',
      name: 'Gnosis Token',
    },
    100: {
      address: '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
      chainId: 100,
      symbol: 'GNO',
      name: 'Gnosis Token from Ethereum',
    },
  },
  [BSC_XDAI_BRIDGE]: {
    56: {
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      chainId: 56,
      symbol: 'WBNB',
      name: 'Wrapped BNB',
    },
    100: {
      address: '0xCa8d20f3e0144a72C6B5d576e9Bd3Fd8557E2B04',
      chainId: 100,
      symbol: 'WBNB',
      name: 'Wrapped BNB on GC',
    },
  },
  [GOERLI_XDAI_BRIDGE]: {
    5: {
      address: '0x7f477c3f03213970d939104cc436dc995cf615b5',
      chainId: 5,
      symbol: 'GNO',
      name: 'Testnet GNO on Goerli',
    },
    10200: {
      address: '0x19C653Da7c37c66208fbfbE8908A5051B57b4C70',
      chainId: 10200,
      symbol: 'GNO',
      name: 'Testnet GNO on Chiado',
    },
  },
};
