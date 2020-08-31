import { ApolloProvider } from '@apollo/react-hooks';
import { ChakraProvider, CSSReset } from '@chakra-ui/core';
import ApolloClient from 'apollo-boost';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { Layout } from './components/Layout';
import { BridgeProvider } from './lib/BridgeContext';
import { Web3Provider } from './lib/Web3Context';
import { Routes } from './Routes';
import { theme } from './theme';

// You should replace this url with your own and put it into a .env file
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app',
});
export const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <ApolloProvider client={client}>
        <Web3Provider>
          <BridgeProvider>
            <Router>
              <Layout>
                <Routes />
              </Layout>
            </Router>
          </BridgeProvider>
        </Web3Provider>
      </ApolloProvider>
    </ChakraProvider>
  );
};
