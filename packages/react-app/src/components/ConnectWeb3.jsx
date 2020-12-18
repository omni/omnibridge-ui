import { Flex, Text, Button } from '@chakra-ui/react';
import React, { useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';

export const ConnectWeb3 = () => {
  const { connectWeb3 } = useContext(Web3Context);

  return (
    <Flex
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      w="100%"
      mt="5rem"
      p="2rem"
      maxW="27.5rem"
      mx={4}
    >
      <Flex
        bg="blue.500"
        borderRadius="50%"
        p="1rem"
        justify="center"
        align="center"
        color="white"
        mb={4}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4 0C1.79086 0 0 1.79086 0 4V6H20V4C20 1.79086 18.2091 0 16 0H4ZM0 8H24C26.2091 8 28 9.79086 28 12V24C28 26.2091 26.2091 28 24 28H4C1.79086 28 0 26.2091 0 24V8ZM18 18C18 17.4477 18.4477 17 19 17H24C24.5523 17 25 17.4477 25 18C25 18.5523 24.5523 19 24 19H19C18.4477 19 18 18.5523 18 18Z"
            fill="white"
          ></path>
        </svg>
      </Flex>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Connect Wallet
      </Text>
      <Text color="greyText" mb={4}>
        To get started, connect your wallet
      </Text>
      <Button onClick={connectWeb3} colorScheme="blue" px={12}>
        Connect
      </Button>
    </Flex>
  );
};
