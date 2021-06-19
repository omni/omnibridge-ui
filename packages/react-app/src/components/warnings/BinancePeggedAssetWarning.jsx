import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import React from 'react';

const binancePeggedAssets = {
  ['0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'.toLowerCase()]: {
    fromSymbol: 'WXDAI',
    toSymbol: 'DAI',
    componentFinanceLink:
      'https://xdai.component.finance/?tab=swap&token0=1&token1=3',
  },
  ['0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.toLowerCase()]: {
    fromSymbol: 'USDC',
    toSymbol: 'USDC',
    componentFinanceLink:
      'https://xdai.component.finance/?tab=swap&token0=2&token1=4',
  },
};

const getBinancePeggedAsset = tokenAddress =>
  binancePeggedAssets[tokenAddress.toLowerCase()] ||
  binancePeggedAssets[
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'.toLowerCase()
  ];

const getComponentFinanceLink = tokenAddress =>
  getBinancePeggedAsset(tokenAddress).componentFinanceLink;

const getBinancePeggedAssetSymbol = tokenAddress =>
  getBinancePeggedAsset(tokenAddress).toSymbol;

export const isERC20ExchangableBinancePeggedAsset = token => {
  if (!token) {
    return false;
  }

  return Object.keys(binancePeggedAssets).includes(token.address.toLowerCase());
};

const ComponentFinanceLink = ({ tokenAddress }) => (
  <Link
    href={getComponentFinanceLink(tokenAddress)}
    color="blue.500"
    isExternal
  >
    Component.Finance
  </Link>
);

export const BinancePeggedAssetWarning = ({
  token: { symbol, address },
  noShadow = false,
}) => {
  const binancePeggedAssetSymbol = getBinancePeggedAssetSymbol(address);
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          Bridging {symbol} token to Binance Smart Chain DOES NOT unlock
          Binance-Peg {binancePeggedAssetSymbol} token. If you want Binance-Peg{' '}
          {binancePeggedAssetSymbol}, exchange
          {symbol} on <ComponentFinanceLink tokenAddress={address} />.
        </Text>
      </Alert>
    </Flex>
  );
};
