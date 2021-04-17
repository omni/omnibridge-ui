import { Flex, Image, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useRPCHealth } from 'hooks/useRPCHealth';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

export const RPCHealthAlert = () => {
  const { foreignHealthy, homeHealthy } = useRPCHealth();
  const { foreignChainId, homeChainId } = useBridgeDirection();

  if (foreignHealthy && homeHealthy) return null;

  const bothSides = !homeHealthy && !foreignHealthy;

  return (
    <Flex w="100%" align="center" mb={4}>
      <Flex
        w="100%"
        borderRadius="0.5rem"
        border="1px solid #DAE3F0"
        bg="white"
      >
        <Flex
          bg="#FFF7EF"
          borderLeftRadius="0.5rem"
          border="1px solid #FFAA5C"
          justify="center"
          align="center"
          minW="4rem"
          maxW="4rem"
          flex={1}
        >
          <Image src={AlertImage} />
        </Flex>
        <Flex align="center" p={4}>
          <Text fontSize="0.75rem">
            {`The ${!homeHealthy ? getNetworkName(homeChainId) : ''} ${
              bothSides ? 'and' : ''
            } ${
              !foreignHealthy ? getNetworkName(foreignChainId) : ''
            } RPC-node${
              bothSides ? 's are' : ' is'
            } not responding. Please set custom RPC URL in settings or come back later.`}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
