import { Flex, Grid, Text, useBreakpointValue } from '@chakra-ui/react';
import React, { useContext } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { HOME_NETWORK } from '../lib/constants';
import { getBridgeNetwork, getNetworkName } from '../lib/helpers';
import { AdvancedMenu } from './AdvancedMenu';
import { BridgeLoadingModal } from './BridgeLoadingModal';
import { ClaimTokensModal } from './ClaimTokensModal';
import { ClaimTransferModal } from './ClaimTransferModal';
import { DaiWarning, isERC20DaiAddress } from './DaiWarning';
import { FromToken } from './FromToken';
import { SystemFeedback } from './SystemFeedback';
import { ToToken } from './ToToken';
import { TransferButton } from './TransferButton';
import { UnlockButton } from './UnlockButton';

export const BridgeTokens = () => {
  const { providerChainId: chainId } = useContext(Web3Context);
  const { fromToken, txHash, loading } = useContext(BridgeContext);
  const isERC20Dai = isERC20DaiAddress(fromToken);
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const bridgeChainId = getBridgeNetwork(chainId);

  return (
    <Flex
      w={{ base: undefined, lg: 'calc(100% - 4rem)' }}
      maxW="75rem"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      direction="column"
      align="center"
      p={{ base: 4, md: 8 }}
      mx={{ base: 4, sm: 8 }}
      my="auto"
    >
      <BridgeLoadingModal />
      {!!txHash && !loading && chainId === getBridgeNetwork(HOME_NETWORK) ? (
        <ClaimTransferModal />
      ) : (
        <ClaimTokensModal />
      )}

      {!smallScreen && (
        <Flex w="100%" justify="space-between">
          <Flex align="flex-start" direction="column">
            <Text color="greyText" fontSize="sm">
              From
            </Text>
            <Text fontWeight="bold" fontSize="lg">
              {getNetworkName(chainId)}
            </Text>
          </Flex>
          {isERC20Dai && <DaiWarning />}
          <Flex align="flex-end" direction="column">
            <Text color="greyText" fontSize="sm">
              To
            </Text>
            <Text fontWeight="bold" fontSize="lg" textAlign="right">
              {getNetworkName(bridgeChainId)}
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
              {getNetworkName(chainId)}
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
              {getNetworkName(bridgeChainId)}
            </Text>
          </Flex>
        )}
        <ToToken />
      </Grid>
      <AdvancedMenu />
      <SystemFeedback />
    </Flex>
  );
};
