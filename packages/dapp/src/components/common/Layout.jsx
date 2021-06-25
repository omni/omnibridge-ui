import { Flex, Image } from '@chakra-ui/react';
import DownTriangle from 'assets/down-triangle.svg';
import UpTriangle from 'assets/up-triangle.svg';
import { ConnectWeb3 } from 'components/common/ConnectWeb3';
import { Footer } from 'components/common/Footer';
import { Header } from 'components/common/Header';
import { TermsOfServiceModal } from 'components/modals/TermsOfServiceModal';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import React, { useMemo } from 'react';

export const Layout = ({ children }) => {
  const { homeChainId, foreignChainId } = useBridgeDirection();
  const { account, providerChainId } = useWeb3Context();
  const { queryToken } = useSettings();

  const isQueryChainProvided =
    queryToken === null || providerChainId === queryToken.chainId;

  const valid = useMemo(
    () =>
      !!account &&
      !!providerChainId &&
      isQueryChainProvided &&
      [homeChainId, foreignChainId].indexOf(providerChainId) >= 0,
    [
      account,
      providerChainId,
      isQueryChainProvided,
      homeChainId,
      foreignChainId,
    ],
  );

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
