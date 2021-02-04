import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import React from 'react';

import { ADDRESS_ZERO, REVERSE_BRIDGE_ENABLED } from '../lib/constants';
import { isxDaiChain } from '../lib/helpers';

export const isNativexDaiAddress = token => {
  if (!token) {
    return false;
  }

  return (
    !REVERSE_BRIDGE_ENABLED &&
    !isxDaiChain(token.chainId) &&
    token.address === ADDRESS_ZERO
  );
};

export const ReverseWarning = ({ isSmallScreen }) => {
  return (
    <Flex align="flex-middle" direction="column" mx={isSmallScreen ? 0 : 2}>
      <Alert status="warning" borderRadius={5} mb={5}>
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          The current version of OmniBridge does not support sending native
          ERC20 tokens from the xDai chain to the Ethereum Mainnet.
        </Text>
      </Alert>
    </Flex>
  );
};
