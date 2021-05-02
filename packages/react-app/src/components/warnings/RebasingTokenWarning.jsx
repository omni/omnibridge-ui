import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import React from 'react';

const ExceptionsLink = ({ msg }) => (
  <Link
    href="https://www.xdaichain.com/for-users/bridges/omnibridge/exceptions#rebasing-tokens"
    color="blue.500"
    isExternal
  >
    {msg}
  </Link>
);

export const RebasingTokenWarning = ({ token }) => {
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert status="error" borderRadius={5}>
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          {token.symbol} is a rebasing token and cannot be bridged.{' '}
          <ExceptionsLink msg={'Learn more'} />.
        </Text>
      </Alert>
    </Flex>
  );
};
