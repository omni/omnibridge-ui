import { Box, Flex, HStack, Image, Text } from '@chakra-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';

import Logo from '../assets/footer-logo.svg';
import GithubLogo from '../assets/github.svg';
import RaidGuildLogo from '../assets/raid-guild-logo.svg';
import TelegramLogo from '../assets/telegram.svg';
import TwitterLogo from '../assets/twitter.svg';
import xDaiLogo from '../assets/xdai.svg';

export const Footer = () => {
  return (
    <Flex
      position="relative"
      justify="space-between"
      align="center"
      h={20}
      maxW="75rem"
      px={8}
      w="100%"
      color="grey"
      _hover={{ color: 'blue.500' }}
      transition="0.25s"
    >
      <Link to="/">
        <Flex justify="space-around" align="center">
          <Image src={Logo} />
        </Flex>
      </Link>
      <HStack spacing={4}>
        <a
            href="https://xdaichain.com"
            rel="noreferrer noopener"
            target="_blank"
          >
          <Image src={xDaiLogo} />
        </a>
        <a
          href="https://twitter.com/xdaichain"
          rel="noreferrer noopener"
          target="_blank"
        >
          <Image src={TwitterLogo} />
        </a>
        <a
          href="https://t.me/xdaistable"
          rel="noreferrer noopener"
          target="_blank"
        >
          <Image src={TelegramLogo} />
        </a>
        <a
          href="https://github.com/xdaichain"
          rel="noreferrer noopener"
          target="_blank"
        >
          <Image src={GithubLogo} />
        </a>
        <Box w="1px" h={5} background="grey" />
        <a
          href="https://raidguild.org"
          rel="noreferrer noopener"
          target="_blank"
        >
          <Flex align="center" _hover={{}}>
            <Text>Built by</Text>
            <Image src={RaidGuildLogo} ml={2} />
          </Flex>
        </a>
      </HStack>
    </Flex>
  );
};
