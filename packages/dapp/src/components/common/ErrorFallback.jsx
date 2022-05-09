import { Flex, Text } from '@chakra-ui/react';
import React from 'react';

export const ErrorFallback = () => (
  <Flex
    justify="center"
    align="center"
    direction="column"
    w="100%"
    minH="100vh"
  >
    <Text fontSize="lg"> Something went wrong </Text>
    <Text> Please check console for error log </Text>
  </Flex>
);
