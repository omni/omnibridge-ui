import { Flex, Grid, Link, Text } from '@chakra-ui/core';
import React from 'react';

export const HistoryItem = ({ explorer, date, hash }) => (
  <Flex
    key={hash}
    w="100%"
    background="white"
    boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
    borderRadius="1rem"
    p={8}
    mb={4}
  >
    <Grid templateColumns="2fr 3fr" w="100%">
      <Text>{`${date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })} ${date.toLocaleDateString().replaceAll('/', '.')}`}</Text>
      <a
        href={`${explorer}/tx/${hash}`}
        rel="noreferrer noopener"
        target="_blank"
      >
        <Link color="blue.500">{hash}</Link>
      </a>
    </Grid>
  </Flex>
);
