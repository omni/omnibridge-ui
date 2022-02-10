import { BSCETHTokenWarnings } from 'components/warnings/BSCETHTokenWarnings';
import { BSCGCTokenWarnings } from 'components/warnings/BSCGCTokenWarnings';
import { DaiWarning } from 'components/warnings/DaiWarning';
import { GCOriginOnBSCTokenWarning } from 'components/warnings/GCOriginOnBSCTokenWarning';
import { RebasingTokenWarning } from 'components/warnings/RebasingTokenWarning';
import { SafeMoonTokenWarning } from 'components/warnings/SafeMoonTokenWarning';
import { StakeTokenWarning } from 'components/warnings/StakeTokenWarning';
import React from 'react';

export const TokenWarnings = ({ token, noShadow = false }) =>
  token ? (
    <>
      <StakeTokenWarning {...{ token, noShadow }} />
      <BSCGCTokenWarnings {...{ token, noShadow }} />
      <BSCETHTokenWarnings {...{ token, noShadow }} />
      <DaiWarning {...{ token, noShadow }} />
      <RebasingTokenWarning {...{ token, noShadow }} />
      <SafeMoonTokenWarning {...{ token, noShadow }} />
      <GCOriginOnBSCTokenWarning {...{ token, noShadow }} />
    </>
  ) : null;
