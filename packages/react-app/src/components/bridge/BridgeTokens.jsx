import { Flex, Grid, Text, useBreakpointValue } from '@chakra-ui/react';
import { AdvancedMenu } from 'components/bridge/AdvancedMenu';
import { FromToken } from 'components/bridge/FromToken';
import { RPCHealthAlert } from 'components/bridge/RPCHealthAlert';
import { SystemFeedback } from 'components/bridge/SystemFeedback';
import { ToToken } from 'components/bridge/ToToken';
import { TransferButton } from 'components/bridge/TransferButton';
import { UnlockButton } from 'components/bridge/UnlockButton';
import { BridgeLoadingModal } from 'components/modals/BridgeLoadingModal';
import { ClaimTokensModal } from 'components/modals/ClaimTokensModal';
import { ClaimTransferModal } from 'components/modals/ClaimTransferModal';
import { DaiWarning, isERC20DaiAddress } from 'components/warnings/DaiWarning';
import { ReverseWarning } from 'components/warnings/ReverseWarning';
import { BridgeContext } from 'contexts/BridgeContext';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { ADDRESS_ZERO } from 'lib/constants';
import { getNetworkName } from 'lib/helpers';
import React, { useContext } from 'react';

export const BridgeTokens = () => {
  const { providerChainId: chainId } = useWeb3Context();
  const {
    getBridgeChainId,
    foreignChainId,
    enableReversedBridge,
  } = useBridgeDirection();
  const { fromToken, toToken, txHash, loading } = useContext(BridgeContext);
  const { neverShowClaims, needsSaving } = useSettings();
  const isERC20Dai =
    !!fromToken &&
    fromToken.chainId === foreignChainId &&
    isERC20DaiAddress(fromToken);
  const showReverseBridgeWarning =
    !!toToken &&
    !enableReversedBridge &&
    toToken.chainId === foreignChainId &&
    toToken.address === ADDRESS_ZERO;
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const bridgeChainId = getBridgeChainId(chainId);

  const txNeedsClaiming = !!txHash && !loading && chainId === foreignChainId;
  return (
    <Flex
      align="center"
      justify="center"
      direction="column"
      w={{ base: undefined, lg: 'calc(100% - 4rem)' }}
      my="auto"
      mx={{ base: 4, sm: 8 }}
    >
      <RPCHealthAlert />
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
        {txNeedsClaiming ? <ClaimTransferModal /> : null}
        {txNeedsClaiming || neverShowClaims || needsSaving ? null : (
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
            {showReverseBridgeWarning && <ReverseWarning />}
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
          {smallScreen && showReverseBridgeWarning && (
            <ReverseWarning isSmallScreen />
          )}
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
    </Flex>
  );
};
