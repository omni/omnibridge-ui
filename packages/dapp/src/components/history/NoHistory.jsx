import { Box, Button, Flex, Grid, Image, Text } from '@chakra-ui/react';
import NoHistoryImage from 'assets/no-history.svg';
import React from 'react';
import { Link } from 'react-router-dom';

export const NoHistory = () => (
  <Flex
    w="100%"
    background="white"
    boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
    borderRadius="1rem"
    p={8}
    direction="column"
    align="center"
  >
    <Box w="100%" h="7.5rem" overflow="hidden" position="relative">
      <Grid
        templateColumns="1fr 1fr 1fr 1fr 1fr"
        w="67rem"
        h="7.5rem"
        gap={8}
        position="absolute"
        left="50%"
        top="0"
        transform="translateX(-50%)"
      >
        <Flex
          h="100%"
          w="12rem"
          borderRadius="10px"
          background="lightBackground"
        />
        <Flex h="100%" w="12rem" borderRadius="10px" background="background" />

        <Flex
          h="100%"
          w="11rem"
          borderRadius="10px"
          background="lightBackground"
        >
          <Image w="100%" h="100%" src={NoHistoryImage} />
        </Flex>
        <Flex h="100%" w="12rem" borderRadius="10px" background="background" />
        <Flex
          h="100%"
          w="12rem"
          borderRadius="10px"
          background="lightBackground"
        />
      </Grid>
    </Box>
    <Text fontWeight="bold" mt={8}>
      No History Found
    </Text>
    <Link to="/">
      <Button colorScheme="blue" mt={4}>
        Make Transfer
      </Button>
    </Link>
  </Flex>
);
