import { Flex, Image, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import { useGraphHealth } from 'hooks/useGraphHealth';
import React from 'react';

export const GraphHealthAlert = () => {
  const { foreignHealthy, homeHealthy } = useGraphHealth(
    'Cannot access history data. Wait for a few minutes and reload the application',
    {
      disableAlerts: true,
    },
  );
  if (foreignHealthy && homeHealthy) return null;

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
            The Graph service may not work properly and some transfers may not
            display. You can use the form below to claim your tokens.
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
