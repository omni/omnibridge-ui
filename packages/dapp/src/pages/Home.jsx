import { BridgeTokens } from 'components/bridge/BridgeTokens';
import { Header } from 'components/common/Header';
import { BridgeProvider } from 'contexts/BridgeContext';
import React from 'react';

export const Home = () => (
  <BridgeProvider>
    <Header />
    <BridgeTokens />
  </BridgeProvider>
);
