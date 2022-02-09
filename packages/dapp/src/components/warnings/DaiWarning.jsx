import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { ETH_XDAI_BRIDGE } from 'lib/constants';
import React from 'react';

const ERC20_DAI_ADDRESS =
  '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase();

export const isERC20DaiAddress = token => {
  if (!token) return false;

  const { chainId, address } = token;
  return chainId === 1 && address.toLowerCase() === ERC20_DAI_ADDRESS;
};

const XDaiBridgeLink = () => (
  <Link href="https://bridge.xdaichain.com/" color="blue.500" isExternal>
    xDai Ethereum Bridge
  </Link>
);

export const DaiWarning = ({ token, noShadow = false }) => {
  const { bridgeDirection } = useBridgeDirection();
  const isERC20Dai =
    bridgeDirection === ETH_XDAI_BRIDGE && isERC20DaiAddress(token);

  return isERC20Dai ? (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="error"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          Bridging DAI token to Gnosis Chain DOES NOT mint native xDai token. If
          you want native xDai, use the <XDaiBridgeLink />.
        </Text>
      </Alert>
    </Flex>
  ) : null;
};
