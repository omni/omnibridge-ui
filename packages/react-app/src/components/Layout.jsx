import { Flex, Image } from '@chakra-ui/react';
import React, { useContext } from 'react';

import DownTriangle from '../assets/down-triangle.svg';
import UpTriangle from '../assets/up-triangle.svg';
import { Web3Context } from '../contexts/Web3Context';
import { HOME_NETWORK } from '../lib/constants';
import { getBridgeNetwork } from '../lib/helpers';
import { ConnectWeb3 } from './ConnectWeb3';
import { Footer } from './Footer';
import { Header } from './Header';
import { TermsOfServiceModal } from './TermsOfServiceModal';

export const Layout = ({ children }) => {
  const { account, providerChainId } = useContext(Web3Context);
  const valid =
    !!account &&
    [HOME_NETWORK, getBridgeNetwork(HOME_NETWORK)].indexOf(providerChainId) >=
      0;
  return (
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
      <Header />
      <Flex
        flex={1}
        align="center"
        justify="flex-start"
        direction="column"
        w="100%"
        h="100%"
        position="relative"
      >
        {valid ? children : <ConnectWeb3 />}
      </Flex>
      <Footer />
      <TermsOfServiceModal />
    </Flex>
  );
};
