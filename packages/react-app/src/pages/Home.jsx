import { BridgeTokens } from 'components/bridge/BridgeTokens';
import { BridgeProvider } from 'contexts/BridgeContext';
import React from 'react';

export const Home = () => (
  <BridgeProvider>
    <BridgeTokens />
  </BridgeProvider>
);
