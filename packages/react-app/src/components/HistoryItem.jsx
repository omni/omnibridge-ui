import { Flex, Grid, Link, Text, useBreakpointValue } from '@chakra-ui/core';
import React from 'react';

export const HistoryItem = ({ explorer, date, hash }) => {
  const linkText = useBreakpointValue({
    base: 'View Transaction',
    md: hash,
  });
  return (
    <Flex
      w="100%"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      p={{ base: 4, sm: 8 }}
      mb={4}
    >
      <Grid templateColumns={{ base: '2fr 2fr', md: '2fr 3fr' }} w="100%">
        <Text>{`${date.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })} ${date.toLocaleDateString().replaceAll('/', '.')}`}</Text>
        <Link
          color="blue.500"
          href={`${explorer}/tx/${hash}`}
          rel="noreferrer noopener"
          target="_blank"
        >
          {linkText}
        </Link>
      </Grid>
    </Flex>
  );
};
