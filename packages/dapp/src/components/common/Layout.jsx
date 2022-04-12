import { Flex, Image } from '@chakra-ui/react';
import DownTriangle from 'assets/down-triangle.svg';
import UpTriangle from 'assets/up-triangle.svg';
import { Footer } from 'components/common/Footer';
import { TermsOfServiceModal } from 'components/modals/TermsOfServiceModal';
import React from 'react';

export const Layout = ({ children }) => (
  <Flex
    p={0}
    m={0}
    overflowX="hidden"
    fontFamily="body"
    w="100%"
    minH="100vh"
    align="center"
    direction="column"
    background="background"
    position="relative"
  >
    <Image
      src={DownTriangle}
      position="absolute"
      right="min(-15rem, -20%)"
      w="60rem"
      minWidth="30rem"
      opacity={0.99}
    />
    <Image
      src={UpTriangle}
      position="absolute"
      left="min(-27rem, -20%)"
      w="81rem"
      minWidth="60rem"
      opacity={0.99}
    />
    <Flex
      flex={1}
      align="center"
      justify="flex-start"
      direction="column"
      w="100%"
      h="100%"
      position="relative"
    >
      {children}
    </Flex>
    <Footer />
    <TermsOfServiceModal />
  </Flex>
);
