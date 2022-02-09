import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useTokenGCOriginOnBSC } from 'hooks/useTokenDisabled';
import React from 'react';

export const GCOriginOnBSCTokenWarning = ({ token, noShadow = false }) => {
  const { isToken } = useTokenGCOriginOnBSC(token);

  if (!token || !isToken) return null;

  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="error"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          Bridging of tokens initially bridged from the Gnosis Chain is not
          allowed in this direction. Bridge them back to the Gnosis Chain and
          then to the Ethereum Mainnet.
        </Text>
      </Alert>
    </Flex>
  );
};
