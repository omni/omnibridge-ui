import {
  Alert,
  AlertIcon,
  Flex,
  Grid,
  Text,
  useBreakpointValue,
} from '@chakra-ui/core';
import React, { useContext } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { DaiWarning, isERC20DaiAddress } from './DaiWarning';
import { FromToken } from './FromToken';
import { LoadingModal } from './LoadingModal';
import { SystemFeedback } from './SystemFeedback';
import { ToToken } from './ToToken';
import { TransferButton } from './TransferButton';
import { UnlockButton } from './UnlockButton';

export const BridgeTokens = () => {
  const { network } = useContext(Web3Context);
  const { fromToken } = useContext(BridgeContext);
  const isERC20Dai = isERC20DaiAddress(fromToken)
  const smallScreen = useBreakpointValue({ base: true, lg: false });

  return (
    <Flex
      w="calc(100% - 2rem)"
      maxW="75rem"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      p={{ base: 4, md: 8 }}
      mx={4}
      my="auto"
    >
      <LoadingModal />
      {network && (
        <>
          {!smallScreen && (
            <Flex w="100%" justify="space-between">
              <Flex align="flex-start" direction="column">
                <Text color="greyText" fontSize="sm">
                  From
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                  {network.name}
                </Text>
              </Flex>
              {isERC20Dai && <DaiWarning />}
              <Flex align="flex-end" direction="column">
                <Text color="greyText" fontSize="sm">
                  To
                </Text>
                <Text fontWeight="bold" fontSize="lg" textAlign="right">
                  {network.bridge.name}
                </Text>
              </Flex>
            </Flex>
          )}
          <Grid
            templateColumns={{ base: 'initial', lg: '2fr 1fr 2fr' }}
            width="100%"
            my={4}
          >
            {smallScreen && isERC20Dai && <DaiWarning />}
            {smallScreen && (
              <Flex align="flex-start" direction="column" m={2}>
                <Text color="greyText" fontSize="sm">
                  From
                </Text>
                <Text fontWeight="bold" fontSize="lg">
                  {network.name}
                </Text>
              </Flex>
            )}
            <FromToken />
            <Flex
              direction="column"
              px={{ base: 2, lg: 4 }}
              my={{ base: 2, lg: 0 }}
              align="center"
              w="100%"
            >
              <UnlockButton />
              <TransferButton />
            </Flex>
            {smallScreen && (
              <Flex align="flex-end" direction="column" m={2}>
                <Text color="greyText" fontSize="sm">
                  To
                </Text>
                <Text fontWeight="bold" fontSize="lg" textAlign="right">
                  {network.bridge.name}
                </Text>
              </Flex>
            )}
            <ToToken />
          </Grid>
          <SystemFeedback />
        </>
      )}
    </Flex>
  );
};
