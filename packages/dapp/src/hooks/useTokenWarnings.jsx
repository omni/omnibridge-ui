import {
  BinancePeggedAssetWarning,
  isBSCPeggedToken,
  isGCStableToken,
} from 'components/warnings/BinancePeggedAssetWarning';
import { DaiWarning } from 'components/warnings/DaiWarning';
import {
  isRebasingToken,
  RebasingTokenWarning,
} from 'components/warnings/RebasingTokenWarning';
import {
  isSafeMoonToken,
  SafeMoonTokenWarning,
} from 'components/warnings/SafeMoonTokenWarning';
import {
  isDisabledStakeToken,
  StakeTokenWarning,
} from 'components/warnings/StakeTokenWarning';
import { BSC_XDAI_BRIDGE } from 'lib/constants';
import React from 'react';

import { useBridgeDirection } from './useBridgeDirection';

export const useTokenWarnings = ({ token, noShadow = false }) => {
  const { bridgeDirection } = useBridgeDirection();
  if (!token) return { isBridgingDisabled: false, warnings: null };
  const isTokenRebasing = isRebasingToken(token);
  const isTokenSafeMoon = isSafeMoonToken(token);
  const isTokenDisabledStake = isDisabledStakeToken(token);
  const isTokenBSCPegged = isBSCPeggedToken(token);
  const isTokenGCStableToBSC =
    isGCStableToken(token) && bridgeDirection === BSC_XDAI_BRIDGE;
  const isBridgingDisabled =
    isTokenRebasing ||
    isTokenSafeMoon ||
    isTokenDisabledStake ||
    isTokenGCStableToBSC ||
    isTokenBSCPegged;
  const warnings = (
    <>
      <StakeTokenWarning {...{ token, noShadow }} />
      <BinancePeggedAssetWarning {...{ token, noShadow }} />
      <DaiWarning {...{ token, noShadow }} />
      {isTokenRebasing && <RebasingTokenWarning {...{ token, noShadow }} />}
      {isTokenSafeMoon && <SafeMoonTokenWarning {...{ token, noShadow }} />}
    </>
  );
  return { isBridgingDisabled, warnings };
};
