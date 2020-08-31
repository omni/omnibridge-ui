import WalletConnectProvider from '@walletconnect/web3-provider';
import ethers from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { networkOptions } from '../components/NetworkSelector';
import { CONFIG } from '../config';

export const Web3Context = React.createContext({});

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: CONFIG.infuraId,
    },
  },
};

const web3Modal = new Web3Modal({
  network: 'mainnet',
  cacheProvider: true,
  providerOptions,
});

export const Web3Provider = ({ children }) => {
  const [providerNetwork, setProviderNetwork] = useState();
  const [chosenNetwork, setChosenNetwork] = useState(networkOptions[0]);
  const [ethersProvider, setEthersProvider] = useState();
  const [account, setAccount] = useState();
  const [networkMismatch, setNetworkMismatch] = useState(false);

  const connectWeb3 = useCallback(async () => {
    try {
      const modalProvider = await web3Modal.connect();

      const web3Provider = new Web3(modalProvider);
      const provider = new ethers.providers.Web3Provider(
        web3Provider.currentProvider,
      );

      setEthersProvider(provider);
      const network = await provider.getNetwork();
      setProviderNetwork(network);
      if (chosenNetwork && network.chainId !== chosenNetwork.value) {
        setNetworkMismatch(true);
      }
      const signer = provider.getSigner();
      const gotAccount = await signer.getAddress();
      setAccount(gotAccount);
    } catch (error) {
      // eslint-disable-next-line
      console.log({ networkError: error });
    }
  }, [chosenNetwork]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setAccount();
  }, []);

  const setNetwork = (network) => {
    try {
      setChosenNetwork(network);
      if (providerNetwork && providerNetwork.chainId !== network.value) {
        setNetworkMismatch(true);
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log({ networkError: error });
    }
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWeb3().catch(console.error);
    }
  }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        disconnect,
        network: chosenNetwork,
        setNetwork,
        account,
        networkMismatch,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
