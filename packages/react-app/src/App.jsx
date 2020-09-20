import { ChakraProvider, CSSReset } from '@chakra-ui/core';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { BridgeProvider } from './contexts/BridgeContext';
import { Web3Provider } from './contexts/Web3Context';
import { Routes } from './Routes';
import { theme } from './theme';

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <ErrorBoundary>
        <Web3Provider>
          <BridgeProvider>
            <Router>
              <Layout>
                <Routes />
              </Layout>
            </Router>
          </BridgeProvider>
        </Web3Provider>
      </ErrorBoundary>
    </ChakraProvider>
  );
};
