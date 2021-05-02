import { Alert, AlertIcon, Flex, Link, Text, Checkbox } from '@chakra-ui/react';
import React from 'react';

const ExceptionsLink = ({ msg }) => (
  <Link
    href="https://www.xdaichain.com/for-users/bridges/omnibridge/exceptions"
    color="blue.500"
    isExternal
  >
    {msg}
  </Link>
);

export const InflationaryTokenWarning = ({ token, isChecked, setChecked }) => {
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert status="warning" borderRadius={5} mb="4">
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          {token.symbol} is an inflationary token. Any accumulated gains WILL
          NOT be added to your balance upon exit. Please see{' '}
          <ExceptionsLink msg={'the documentation'} /> before bridging.
        </Text>
      </Alert>
      <Checkbox
        w="100%"
        isChecked={isChecked}
        onChange={e => setChecked(e.target.checked)}
        borderColor="grey"
        borderRadius="4px"
        size="lg"
        variant="solid"
      >
        <Text fontSize="sm">
          I agree to proceed and understand I will not receive inflation.
        </Text>
      </Checkbox>
    </Flex>
  );
};
