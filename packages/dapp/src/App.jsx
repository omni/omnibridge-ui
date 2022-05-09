import 'focus-visible/dist/focus-visible';

import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { css, Global } from '@emotion/react';
import { ErrorBoundary } from '@sentry/react';
import { ErrorFallback } from 'components/common/ErrorFallback';
import { Layout } from 'components/common/Layout';
import { Routes } from 'components/common/Routes';
import { SettingsProvider } from 'contexts/SettingsContext';
import { Web3Provider } from 'contexts/Web3Context';
import { logError } from 'lib/helpers';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { theme } from 'theme';

const GlobalStyles = css`
  /*
    This will hide the focus indicator if the element receives focus via the mouse,
    but it will still show up on keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
`;

export const App = () => (
  <ChakraProvider theme={theme}>
    <CSSReset />
    <Global styles={GlobalStyles} />
    <ErrorBoundary
      fallback={<ErrorFallback />}
      onError={error => logError(error)}
    >
      <Router>
        <SettingsProvider>
          <Web3Provider>
            <Layout>
              <Routes />
            </Layout>
          </Web3Provider>
        </SettingsProvider>
      </Router>
    </ErrorBoundary>
  </ChakraProvider>
);
