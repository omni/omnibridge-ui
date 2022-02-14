import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { BSC_XDAI_BRIDGE } from 'lib/constants';
import React from 'react';

const GC_STABLE_ASSETS = [
  '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83'.toLowerCase(),
  '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'.toLowerCase(),
  '0x44fA8E6f47987339850636F88629646662444217'.toLowerCase(),
  '0x4ECaBa5870353805a9F068101A40E0f32ed605C6'.toLowerCase(),
];

const DAI_TOKEN = '0x44fA8E6f47987339850636F88629646662444217'.toLowerCase();

const XpollinateLink = () => (
  <Link href="https://xpollinate.io/" color="blue.500" isExternal>
    Xpollinate
  </Link>
);

const BSC_BINANCE_PEGGED_ASSETS = [
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'.toLowerCase(), // USDC
  '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3'.toLowerCase(), // DAI
];

export const isBSCPeggedToken = token => {
  if (!token) return false;
  const { address, chainId } = token;
  return (
    chainId === 56 && BSC_BINANCE_PEGGED_ASSETS.includes(address.toLowerCase())
  );
};

export const isGCStableToken = token => {
  if (!token) return false;
  const { address, chainId } = token;
  return chainId === 100 && GC_STABLE_ASSETS.includes(address.toLowerCase());
};

export const BSCGCTokenWarnings = ({ token, noShadow = false }) => {
  const { symbol, address } = token;
  const { bridgeDirection } = useBridgeDirection();
  if (bridgeDirection !== BSC_XDAI_BRIDGE) return null;
  const isGCToken = isGCStableToken(token);
  const isBSCToken = isBSCPeggedToken(token);

  if (isGCToken) {
    return (
      <Flex align="center" direction="column" w="100%" mb="4">
        <Alert
          status="error"
          borderRadius={5}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          <Text fontSize="small">
            Bridging of {symbol} tokens to Binance Smart Chain is disabled,
            {address.toLowerCase() === DAI_TOKEN
              ? ' bridge tokens back to the Ethereum Mainnet and '
              : ' please '}
            use <XpollinateLink /> bridge by Connext instead.
          </Text>
        </Alert>
      </Flex>
    );
  }
  if (isBSCToken) {
    return (
      <Flex align="center" direction="column" w="100%" mb="4">
        <Alert
          status="error"
          borderRadius={5}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          <Text fontSize="small">
            Bridging of Binance-Peg {symbol} tokens to the Gnosis Chain is
            disabled, please use <XpollinateLink /> bridge by Connext instead.
          </Text>
        </Alert>
      </Flex>
    );
  }
  return null;
};
