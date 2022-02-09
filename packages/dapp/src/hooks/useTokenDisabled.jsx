import {
  isBSCPeggedToken,
  isGCStableToken,
} from 'components/warnings/BinancePeggedAssetWarning';
import { isRebasingToken } from 'components/warnings/RebasingTokenWarning';
import { isSafeMoonToken } from 'components/warnings/SafeMoonTokenWarning';
import { isDisabledStakeToken } from 'components/warnings/StakeTokenWarning';
import { BSC_XDAI_BRIDGE } from 'lib/constants';

import { useBridgeDirection } from './useBridgeDirection';

export const useTokenDisabled = token => {
  const { bridgeDirection } = useBridgeDirection();
  if (!token) return false;
  const isTokenRebasing = isRebasingToken(token);
  const isTokenSafeMoon = isSafeMoonToken(token);
  const isTokenDisabledStake = isDisabledStakeToken(token);
  const isTokenBSCPegged = isBSCPeggedToken(token);
  const isTokenGCStableToBSC =
    isGCStableToken(token) && bridgeDirection === BSC_XDAI_BRIDGE;
  return (
    isTokenRebasing ||
    isTokenSafeMoon ||
    isTokenDisabledStake ||
    isTokenGCStableToBSC ||
    isTokenBSCPegged
  );
};
