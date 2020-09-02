import { Flex, Grid, Text } from '@chakra-ui/core';
import React, { useContext } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { FromToken } from './FromToken';
import { LoadingModal } from './LoadingModal';
import { SystemFeedback } from './SystemFeedback';
import { ToToken } from './ToToken';
import { TransferButton } from './TransferButton';
import { UnlockButton } from './UnlockButton';

export const BridgeTokens = () => {
  const { network } = useContext(Web3Context);
  return (
    <Flex
      w="calc(100% - 2rem)"
      maxW="75rem"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      p={8}
      mx={4}
      my="auto"
    >
      <LoadingModal />
      <Flex w="100%" justify="space-between">
        <Flex align="flex-start" direction="column">
          <Text color="greyText" fontSize="sm">
            From
          </Text>
          <Text fontWeight="bold" fontSize="lg">
            {network.name}
          </Text>
        </Flex>
        <Flex align="flex-end" direction="column">
          <Text color="greyText" fontSize="sm">
            To
          </Text>
          <Text fontWeight="bold" fontSize="lg" textAlign="right">
            {network.bridge.name}
          </Text>
        </Flex>
      </Flex>
      <Grid templateColumns="2fr 1fr 2fr" width="100%" my={4}>
        <FromToken />
        <Flex direction="column" px={{ base: 2, md: 2, lg: 4 }}>
          <UnlockButton />
          <TransferButton />
        </Flex>
        <ToToken />
      </Grid>
      <SystemFeedback />
    </Flex>
  );
};
