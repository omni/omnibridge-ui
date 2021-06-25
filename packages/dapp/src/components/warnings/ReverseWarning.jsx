import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const ReverseWarning = ({ noShadow = false }) => {
  const { homeChainId, foreignChainId } = useBridgeDirection();
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
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
