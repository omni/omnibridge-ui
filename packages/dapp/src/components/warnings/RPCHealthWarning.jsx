import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getNetworkName } from 'lib/helpers';
import React from 'react';
import { getRPCHealth } from 'stores/rpcHealth';

export const RPCHealthWarning = () => {
  const { foreignChainId, homeChainId } = useBridgeDirection();
  const { [foreignChainId]: foreignHealthy, [homeChainId]: homeHealthy } =
    getRPCHealth();

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
