import { Button, Flex, Image, Stack, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import Logo from '../assets/logo.svg';
import { HistoryIcon } from '../icons/HistoryIcon';
import { WalletSelector } from './WalletSelector';

export const Header = () => {
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(open => !open);

  return (
    <Flex
      justify="space-between"
      position="relative"
      align={{ base: 'stretch', md: 'center' }}
      maxW="75rem"
      minH={20}
      mx={8}
      w="calc(100% - 4rem)"
      background={isOpen ? { base: 'white', md: 'transparent' } : 'transparent'}
      direction={{ base: 'column', md: 'row' }}
      mb={isOpen ? { base: 4, md: 0 } : 0}
      boxShadow={
        isOpen ? { base: '0 0.5rem 1rem #CADAEF', md: 'none' } : 'none'
      }
    >
      <Flex justify="space-between" h={20} align="center">
        <Link to="/">
          <Flex justify="space-around" align="center">
            <Image src={Logo} mr={4} />
            <Text fontWeight="bold">OmniBridge</Text>
          </Flex>
        </Link>
        <Button
          variant="link"
          // _focus={{ outline: 'none', border: 'none' }}
          display={{ base: 'block', md: 'none' }}
          color="blue.500"
          _hover={{ color: 'blue.600' }}
          onClick={toggleOpen}
          minW="auto"
        >
          {!isOpen && (
            <svg fill="currentColor" width="1.5rem" viewBox="0 0 20 20">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          )}
          {isOpen && (
            <svg width="1.25rem" viewBox="0 0 18 18" fill="none">
              <title>Close</title>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.2923 17.2923C16.9011 17.6835 16.2669 17.6835 15.8757 17.2923L8.79285 10.2094L1.70996 17.2923C1.31878 17.6835 0.684559 17.6835 0.293382 17.2923C-0.0977942 16.9011 -0.0977941 16.2669 0.293383 15.8757L7.37627 8.79285L0.293383 1.70996C-0.0977941 1.31878 -0.0977942 0.684559 0.293382 0.293382C0.684559 -0.0977943 1.31878 -0.097794 1.70996 0.293383L8.79285 7.37627L15.8757 0.293407C16.2669 -0.09777 16.9011 -0.0977703 17.2923 0.293406C17.6835 0.684583 17.6835 1.31881 17.2923 1.70998L10.2094 8.79285L17.2923 15.8757C17.6835 16.2669 17.6835 16.9011 17.2923 17.2923Z"
                fill="currentColor"
              />
            </svg>
          )}
        </Button>
      </Flex>
      <Stack
        position={{ base: 'relative', md: 'static' }}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        display={{ base: isOpen ? 'flex' : 'none', md: 'flex' }}
        // zIndex={{ base: 1, md: 'auto' }}
        w={{ base: '100%', md: 'auto' }}
        align={{ base: 'flex-start', md: 'center' }}
        pb={{ base: 4, md: 0 }}
      >
        <Link to="/history">
          <Flex
            align="center"
            px={4}
            fontWeight="bold"
            color="grey"
            transition="0.25s"
            _hover={{ color: 'blue.500' }}
          >
            <HistoryIcon mr={2} />
            <Text color="black"> History</Text>
          </Flex>
        </Link>
        <WalletSelector />
        {/* <NetworkSelector /> */}
      </Stack>
    </Flex>
  );
};
