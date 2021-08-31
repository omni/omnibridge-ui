import { Box } from '@chakra-ui/react';
import React, { useEffect } from 'react';

export const CoinzillaBannerAd = props => {
  useEffect(() => {
    window.coinzilla_display = window.coinzilla_display || [];
    window.coinzilla_display.push({
      zone: process.env.REACT_APP_COINZILLA_API_KEY,
      width: window.screen.availWidth >= 728 ? '728' : '320',
      height: window.screen.availWidth >= 728 ? '90' : '100',
    });
  }, []);

  if (!process.env.REACT_APP_COINZILLA_API_KEY) return null;
  return (
    <Box
      className="coinzilla"
      data-zone={`C-${process.env.REACT_APP_COINZILLA_API_KEY}`}
      my="30px"
      mx="auto"
      {...props}
    />
  );
};
