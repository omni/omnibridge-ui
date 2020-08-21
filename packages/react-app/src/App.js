import React from "react";
import ApolloClient from "apollo-boost";
import { Web3Provider } from "./lib/Web3Context";
import { ApolloProvider } from "@apollo/react-hooks";
import { BrowserRouter as Router } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Routes } from "./Routes";

// You should replace this url with your own and put it into a .env file
const client = new ApolloClient({
    uri: "https://api.thegraph.com/subgraphs/name/paulrberg/create-eth-app"
});
function App() {
    return (
        <ApolloProvider client={client}>
            <Web3Provider>
                <Router>
                    <Header />
                    <Routes />
                    <Footer />
                </Router>
            </Web3Provider>
        </ApolloProvider>
    );
}

export default App;
