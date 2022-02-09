import { BinancePeggedAssetWarning } from 'components/warnings/BinancePeggedAssetWarning';
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
import React from 'react';

export const useTokenWarnings = ({ token, noShadow = false }) => {
  if (!token) return { isBridgingDisabled: false, warnings: null };
  const isTokenRebasing = isRebasingToken(token);
  const isTokenSafeMoon = isSafeMoonToken(token);
  const isTokenDisabledStake = isDisabledStakeToken(token);
  const isBridgingDisabled =
    isTokenRebasing || isTokenSafeMoon || isTokenDisabledStake;
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
