import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useRPCHealth } from 'hooks/useRPCHealth';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const RPCHealthWarning = () => {
  const { foreignHealthy, homeHealthy } = useRPCHealth();
  const { foreignChainId, homeChainId } = useBridgeDirection();

  if (foreignHealthy && homeHealthy) return null;

  const bothSides = !homeHealthy && !foreignHealthy;

  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          {`The ${!homeHealthy ? getNetworkName(homeChainId) : ''} ${
            bothSides ? 'and' : ''
          } ${!foreignHealthy ? getNetworkName(foreignChainId) : ''} RPC-node${
            bothSides ? 's are' : ' is'
          } not responding. Please set custom RPC URL in settings or come back later.`}
        </Text>
      </Alert>
    </Flex>
  );
};
