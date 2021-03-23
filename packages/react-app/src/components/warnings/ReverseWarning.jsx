import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const ReverseWarning = ({ isSmallScreen }) => {
  const { homeChainId, foreignChainId } = useBridgeDirection();
  return (
    <Flex align="flex-middle" direction="column" mx={isSmallScreen ? 0 : 2}>
      <Alert status="warning" borderRadius={5} mb={5}>
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          The current version of OmniBridge does not support sending native
          ERC20 tokens from the {getNetworkName(homeChainId)} to the{' '}
          {getNetworkName(foreignChainId)}.
        </Text>
      </Alert>
    </Flex>
  );
};
