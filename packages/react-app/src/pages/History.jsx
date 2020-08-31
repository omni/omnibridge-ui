import { Flex, Grid, Link, Text } from '@chakra-ui/core';
import React from 'react';

export const History = () => {
  return (
    <Flex w="calc(100% - 2rem)" maxW="75rem" direction="column" mt={8} px={4}>
      <Text fontSize="xl" fontWeight="bold" mb={8}>
        History
      </Text>
      <HistoryItem
        date={new Date()}
        hash="0x2b6dfaf95eae5ad9877bfee51c5139cfa6f0782c35ba7a50f5b01500a6cff904"
      />
      <HistoryItem
        date={new Date()}
        hash="0x2b6dfaf95eae5ad9877bfee51c5139cfa6f0782c35ba7a50f5b01500a6cff904"
      />
      <HistoryItem
        date={new Date()}
        hash="0x2b6dfaf95eae5ad9877bfee51c5139cfa6f0782c35ba7a50f5b01500a6cff904"
      />
      <HistoryItem
        date={new Date()}
        hash="0x2b6dfaf95eae5ad9877bfee51c5139cfa6f0782c35ba7a50f5b01500a6cff904"
      />
    </Flex>
  );
};

const HistoryItem = ({ date, hash }) => (
  <Flex
    w="100%"
    background="white"
    boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
    borderRadius="1rem"
    p={8}
    mb={4}
  >
    <Grid templateColumns="2fr 3fr">
      <Text>{date.toLocaleString()}</Text>
      <Link color="blue.500">{hash}</Link>
    </Grid>
  </Flex>
);
