import 'focus-visible/dist/focus-visible';

import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { BridgeProvider } from './contexts/BridgeContext';
import { Web3Provider } from './contexts/Web3Context';
import { Routes } from './Routes';
import { theme } from './theme';

const GlobalStyles = css`
  /*
    This will hide the focus indicator if the element receives focus    via the mouse,
    but it will still show up on keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
`;

export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <Global styles={GlobalStyles} />
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
