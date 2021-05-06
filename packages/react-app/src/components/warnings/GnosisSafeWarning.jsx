import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useWeb3Context } from 'contexts/Web3Context';
import React from 'react';

export const GnosisSafeWarning = ({ noShadow = false }) => {
  const { isGnosisSafe } = useWeb3Context();

  if (!isGnosisSafe) return null;
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          It is mandatory to set an alternative recipient address when
          Omnibridge is loaded as a Gnosis Safe App.
        </Text>
      </Alert>
    </Flex>
  );
};
