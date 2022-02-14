import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { ETH_BSC_BRIDGE } from 'lib/constants';
import React from 'react';

const BSC_ASSETS = [
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'.toLowerCase(), // USDC
  '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'.toLowerCase(), // DAI
  '0x55d398326f99059ff775485246999027b3197955'.toLowerCase(), // USDT
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8'.toLowerCase(), // ETH
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'.toLowerCase(), // WBNB
];

const ETH_ASSETS = [
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'.toLowerCase(), // USDC
  '0x6b175474e89094c44da98b954eedeac495271d0f'.toLowerCase(), // DAI
  '0xdac17f958d2ee523a2206206994597c13d831ec7'.toLowerCase(), // USDT
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'.toLowerCase(), // WETH
  '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'.toLowerCase(), // BNB
];

const isBSCAsset = token => {
  if (!token) return false;
  const { address, chainId } = token;
  return chainId === 56 && BSC_ASSETS.includes(address.toLowerCase());
};

const isETHAsset = token => {
  if (!token) return false;
  const { address, chainId } = token;
  return chainId === 1 && ETH_ASSETS.includes(address.toLowerCase());
};

export const BSCETHTokenWarnings = ({ token, noShadow = false }) => {
  const { bridgeDirection } = useBridgeDirection();
  if (bridgeDirection !== ETH_BSC_BRIDGE) return null;
  const isETHToken = isETHAsset(token);
  const isBSCToken = isBSCAsset(token);

  if (isETHToken) {
    return (
      <Flex align="center" direction="column" w="100%" mb="4">
        <Alert
          status="warning"
          borderRadius={5}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          <Text fontSize="small">
            Bridging this token DOES NOT mint the Binance-Peg token on the
            Binance Smart Chain.
          </Text>
        </Alert>
      </Flex>
    );
  }
  if (isBSCToken) {
    return (
      <Flex align="center" direction="column" w="100%" mb="4">
        <Alert
          status="warning"
          borderRadius={5}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          <Text fontSize="small">
            Bridging this Binance-Peg token to the ETH mainnet DOES NOT mint the
            official ERC20 token.
          </Text>
        </Alert>
      </Flex>
    );
  }
  return null;
};
