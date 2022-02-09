import { Flex, Grid, Text, useBreakpointValue } from '@chakra-ui/react';
import { AdvancedMenu } from 'components/bridge/AdvancedMenu';
import { FromToken } from 'components/bridge/FromToken';
import { SystemFeedback } from 'components/bridge/SystemFeedback';
import { ToToken } from 'components/bridge/ToToken';
import { TransferButton } from 'components/bridge/TransferButton';
import { UnlockButton } from 'components/bridge/UnlockButton';
// import { CoinzillaBannerAd } from 'components/common/CoinzillaBannerAd';
// import { CoinzillaTextAd } from 'components/common/CoinzillaTextAd';
import { BridgeLoadingModal } from 'components/modals/BridgeLoadingModal';
import { GnosisSafeWarning } from 'components/warnings/GnosisSafeWarning';
import {
  InflationaryTokenWarning,
  isInflationaryToken,
} from 'components/warnings/InflationaryTokenWarning';
import { RPCHealthWarning } from 'components/warnings/RPCHealthWarning';
import { TokenWarnings } from 'components/warnings/TokenWarnings';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

import { SwitchButton } from './SwitchButton';

export const BridgeTokens = () => {
  const { providerChainId: chainId } = useWeb3Context();
  const { getBridgeChainId } = useBridgeDirection();
  const { fromToken } = useBridgeContext();
  const isInflationToken = isInflationaryToken(fromToken);

  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const bridgeChainId = getBridgeChainId(chainId);
  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      w={{ base: undefined, lg: 'calc(100% - 4rem)' }}
      maxW="75rem"
      my="auto"
      mx={{ base: 4, sm: 8 }}
    >
      {/* <CoinzillaTextAd /> */}
      <GnosisSafeWarning noCheckbox />
      <RPCHealthWarning />
      {isInflationToken && (
        <InflationaryTokenWarning token={fromToken} noCheckbox />
      )}
      <TokenWarnings token={fromToken} />
      <Flex
        maxW="75rem"
        background="white"
        boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
        borderRadius="1rem"
        direction="column"
        align="center"
        p={{ base: 4, md: 8 }}
      >
        <BridgeLoadingModal />
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
          position="relative"
        >
          <SwitchButton />
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
      {/* <CoinzillaBannerAd /> */}
    </Flex>
  );
};
