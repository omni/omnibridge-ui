import { Box } from '@chakra-ui/react';
import { COINZILLA_API_KEY } from 'lib/constants';
import React, { useEffect } from 'react';

export const CoinzillaBannerAd = props => {
  useEffect(() => {
    window.coinzilla_display = window.coinzilla_display || [];
    window.coinzilla_display.push({
      zone: COINZILLA_API_KEY,
      width: window.screen.availWidth >= 728 ? '728' : '320',
      height: window.screen.availWidth >= 728 ? '90' : '100',
    });
  }, []);

  if (!COINZILLA_API_KEY) return null;
  return (
    <Box
      className="coinzilla"
      data-zone={`C-${COINZILLA_API_KEY}`}
      my="30px"
      mx="auto"
      {...props}
    />
  );
};
