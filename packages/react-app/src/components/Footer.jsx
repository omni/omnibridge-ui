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
        <Image src={xDaiLogo} />
        <Image src={TwitterLogo} />
        <Image src={TelegramLogo} />
        <Image src={GithubLogo} />
        <Box w="1px" h={5} background="grey" />
        <Link to="https://raidguild.org">
          <Flex align="center" _hover={{}}>
            <Text>Built by</Text>
            <Image src={RaidGuildLogo} ml={2} />
          </Flex>
        </Link>
      </HStack>
    </Flex>
  );
};
