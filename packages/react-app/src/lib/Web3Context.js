import React, { useCallback, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";
import ethers from "ethers";
import { CONFIG } from "../config";

const Web3Context = React.createContext({});

const providerOptions = {
    walletconnect: {
        package: WalletConnectProvider,
        options: {
            infuraId: CONFIG.infuraId
        }
    }
};

const web3Modal = new Web3Modal({
    network: "mainnet",
    // Uncomment this if we want to automatically connect
    // cacheProvider: true,
    providerOptions
});

export default Web3Context;

export const Web3Provider = ({ children }) => {
    const [network, setNetwork] = useState("kovan");
    const [ethersProvider, setEthersProvider] = useState(
        new ethers.providers.InfuraProvider(network, CONFIG.infuraId)
    );

    const connectWeb3 = useCallback(async () => {
        try {
            const modalProvider = await web3Modal.connect();

            const web3Provider = new Web3(modalProvider);
            const provider = new ethers.providers.Web3Provider(
                web3Provider.currentProvider
            );

            setEthersProvider(provider);
            const network = await provider.getNetwork();
            setNetwork(network.name);
        } catch (e) {
            throw e;
        }
    }, []);

    const disconnect = useCallback(async () => {
        web3Modal.clearCachedProvider();
    }, []);

    // Uncomment this if we want to automatically connect
    // useEffect(() => {
    //     if (web3Modal.cachedProvider) {
    //         connectWeb3().catch(console.error);
    //     }
    // }, [connectWeb3]);

    return (
        <Web3Context.Provider
            value={{ ethersProvider, connectWeb3, disconnect }}
        >
            {children}
        </Web3Context.Provider>
    );
};
