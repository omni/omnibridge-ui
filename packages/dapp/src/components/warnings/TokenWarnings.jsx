import { BinancePeggedAssetWarning } from 'components/warnings/BinancePeggedAssetWarning';
import { DaiWarning } from 'components/warnings/DaiWarning';
import { RebasingTokenWarning } from 'components/warnings/RebasingTokenWarning';
import { SafeMoonTokenWarning } from 'components/warnings/SafeMoonTokenWarning';
import { StakeTokenWarning } from 'components/warnings/StakeTokenWarning';
import React from 'react';

export const TokenWarnings = ({ token, noShadow = false }) =>
  token ? (
    <>
      <StakeTokenWarning {...{ token, noShadow }} />
      <BinancePeggedAssetWarning {...{ token, noShadow }} />
      <DaiWarning {...{ token, noShadow }} />
      <RebasingTokenWarning {...{ token, noShadow }} />
      <SafeMoonTokenWarning {...{ token, noShadow }} />
    </>
  ) : null;
