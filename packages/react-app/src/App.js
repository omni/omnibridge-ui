import React from 'react';
import ApolloClient from 'apollo-boost';
import { Web3Provider } from './lib/Web3Context';
import { ApolloProvider } from '@apollo/react-hooks';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Routes } from './Routes';
import { ChakraProvider, CSSReset } from '@chakra-ui/core';
import { theme } from './theme';

// You should replace this url with your own and put it into a .env file
const client = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app',
});
function App() {
  return (
    <ChakraProvider theme={theme}>
      <CSSReset />
      <ApolloProvider client={client}>
        <Web3Provider>
          <Router>
            <Layout>
              <Routes />
            </Layout>
          </Router>
        </Web3Provider>
      </ApolloProvider>
    </ChakraProvider>
  );
}

export default App;
