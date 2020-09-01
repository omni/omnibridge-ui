import {
  Button,
  Flex,
  HStack,
  Image,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import Logo from '../assets/logo.svg';
import { Web3Context } from '../contexts/Web3Context';
import { HistoryIcon } from '../icons/HistoryIcon';
import { WalletIcon } from '../icons/WalletIcon';
import { NetworkSelector } from './NetworkSelector';

const getAccountString = (account) => {
  const len = account.length;
  return `${account.substr(0, 6)}...${account.substr(len - 4, len - 1)}`;
};

export const Header = () => {
  const { connectWeb3, disconnect, account } = useContext(Web3Context);

  return (
    <Flex
      justify="space-between"
      position="relative"
      align="center"
      h={20}
      maxW="75rem"
      px={8}
      w="100%"
    >
      <Link to="/">
        <Flex justify="space-around" align="center">
          <Image src={Logo} mr={4} />
          <Text fontWeight="bold">Multi Token Bridge</Text>
        </Flex>
      </Link>
      <HStack spacing={4}>
        <Link to="/history">
          <Flex
            align="center"
            px={4}
            fontWeight="bold"
            color="grey"
            transition="0.5s"
            _hover={{ color: 'blue.500' }}
          >
            <HistoryIcon mr={2} />
            <Text color="black"> History</Text>
          </Flex>
        </Link>
        <Flex>
          {!account && (
            <Button onClick={connectWeb3} colorScheme="blue">
              <WalletIcon mr={2} />
              Connect Wallet
            </Button>
          )}
          {account && (
            <Popover>
              <PopoverTrigger>
                <Button colorScheme="blue">
                  <WalletIcon mr={2} />
                  <Text> {getAccountString(account)} </Text>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                boxShadow="0 0.5rem 1rem #CADAEF"
                border="none"
                width="auto"
                _focus={{ border: 'none', outline: 'none' }}
              >
                <PopoverArrow />
                <PopoverBody width="100%" align="center">
                  <Button
                    colorScheme="blue"
                    onClick={disconnect}
                    _focus={{ border: 'none' }}
                  >
                    <Text> Disconnect </Text>
                  </Button>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}
        </Flex>
        <Flex>
          <NetworkSelector />
        </Flex>
      </HStack>
    </Flex>
  );
};
