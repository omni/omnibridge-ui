import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import React from 'react';

const BSC_SAFEMOON_TOKENS = [
  '0x8076c74c5e3f5852037f31ff0093eeb8c8add8d3'.toLowerCase(),
];

export const isSafeMoonToken = token => {
  if (!token) return false;
  const { chainId, address } = token;
  switch (chainId) {
    case 56:
      return BSC_SAFEMOON_TOKENS.includes(address.toLowerCase());
    default:
      return false;
  }
};

export const SafeMoonTokenWarning = ({ token, noShadow = false }) =>
  isSafeMoonToken(token) ? (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="error"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">SafeMoon tokens cannot be bridged.</Text>
      </Alert>
    </Flex>
  ) : null;
