import React from 'react';

import { NetworkIcon } from '../icons/NetworkIcon';

export const networkOptions = [
  {
    value: 100,
    key: 0,
    bridge: { chainId: 1, name: 'ETH Mainnet' },
    label: 'xDai',
    name: 'xDai Chain',
    icon: <NetworkIcon />,
  },
  {
    value: 1,
    key: 1,
    bridge: { chainId: 100, name: 'xDai Chain' },
    label: 'Mainnet',
    name: 'ETH Mainnet',
    icon: <NetworkIcon />,
  },
  {
    value: 77,
    key: 2,
    bridge: { chainId: 42, name: 'ETH Kovan' },
    label: 'Sokol',
    name: 'Sokol Chain',
    icon: <NetworkIcon />,
  },
  {
    value: 42,
    key: 3,
    bridge: { chainId: 77, name: 'Sokol Chain' },
    label: 'Kovan',
    name: 'ETH Kovan',
    icon: <NetworkIcon />,
  },
];

export const defaultTokens = {
  100: {
    name: 'Stake on xDai',
    address: '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
    symbol: 'STAKE',
    decimals: 18,
    chainId: 100,
    logoURI: '',
  },
  1: {
    name: 'Stake',
    address: '0x0Ae055097C6d159879521C384F1D2123D1f195e6',
    symbol: 'STAKE',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x0Ae055097C6d159879521C384F1D2123D1f195e6/logo.png',
  },
  77: {
    name: 'Stake on Sokol',
    address: '0xDd100c4f827ABAbB2301d562FDBD503aE0d6B1D0',
    symbol: 'STAKE',
    decimals: 18,
    chainId: 77,
    logoURI: '',
  },
  42: {
    name: 'Stake',
    address: '0x1278571f79B3a4245A0865CbF9b24cAE15Aa2938',
    symbol: 'STAKE',
    decimals: 18,
    chainId: 42,
    logoURI: '',
  },
};
