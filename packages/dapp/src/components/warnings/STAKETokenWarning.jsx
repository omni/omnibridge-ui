import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { BSC_XDAI_BRIDGE, ETH_BSC_BRIDGE } from 'lib/constants';
import React from 'react';

export const STAKETokenWarning = ({ noShadow = false }) => {
  const { fromToken } = useBridgeContext();
  const { bridgeDirection } = useBridgeDirection();

  if (!fromToken) return null;
  const { address } = fromToken;

  let innerText = '';
  if (
    address.toLowerCase() ===
      '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'.toLowerCase() &&
    bridgeDirection === BSC_XDAI_BRIDGE
  ) {
    innerText = (
      <>
        Bridging STAKE token from the Binance Smart Chain to the Ethereum
        Mainnet DOES NOT unlock xDai-pegged STAKE token. If you want STAKE token
        on the Ethereum Mainnet{' '}
        <Link
          href="/bridge?from=56&to=100&token=0x24e5CF4a0577563d4e7761D14D53C8D0b504E337"
          color="blue.500"
          isExternal
        >
          bridge it back to the xDai chain first
        </Link>
        .
      </>
    );
  } else if (
    address.toLowerCase() ===
      '0x24e5CF4a0577563d4e7761D14D53C8D0b504E337'.toLowerCase() &&
    bridgeDirection === ETH_BSC_BRIDGE
  ) {
    innerText = (
      <>
        Bridging STAKE token from the xDai chain on the Binance Smart Chain to
        the Ethereum Mainnet DOES NOT mint Binance-pegged STAKE token.
        Don&apos;t send minted token to the Binance deposit address!
      </>
    );
  } else {
    return null;
  }

  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">{innerText}</Text>
      </Alert>
    </Flex>
  );
};
