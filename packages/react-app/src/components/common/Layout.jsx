import { Flex, Image } from '@chakra-ui/react';
import DownTriangle from 'assets/down-triangle.svg';
import UpTriangle from 'assets/up-triangle.svg';
import { ConnectWeb3 } from 'components/common/ConnectWeb3';
import { Footer } from 'components/common/Footer';
import { Header } from 'components/common/Header';
import { TermsOfServiceModal } from 'components/modals/TermsOfServiceModal';
import { useWeb3Context } from 'contexts/Web3Context';
import { FOREIGN_CHAIN_ID, HOME_CHAIN_ID } from 'lib/constants';
import React from 'react';

export const Layout = ({ children }) => {
  const {
    account,
    loading,
    providerChainId,
    isChainIdInjected: { chainId, status },
  } = useWeb3Context();

  let isCustomChainProvided = false;
  if (status && providerChainId !== chainId) {
    isCustomChainProvided = true;
  }

  const valid =
    !loading &&
    !isCustomChainProvided &&
    !!account &&
    [HOME_CHAIN_ID, FOREIGN_CHAIN_ID].indexOf(providerChainId) >= 0;

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
