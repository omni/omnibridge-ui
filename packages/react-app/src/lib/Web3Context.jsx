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
  // Uncomment this if we want to automatically connect
  // cacheProvider: true,
  providerOptions,
});

export const Web3Provider = ({ children }) => {
  const [providerNetwork, setProviderNetwork] = useState();
  const [chosenNetwork, setChosenNetwork] = useState(networkOptions[0]);
  const [ethersProvider, setEthersProvider] = useState();
  const [account, setAccount] = useState();

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
      if (network.chainId !== chosenNetwork.value) {
        throw new Error(
          `Provider network ${network.chainId}, expected ${chosenNetwork.value}`,
        );
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log({ networkError: error });
    }
  }, [chosenNetwork]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
  }, []);

  const setNetwork = (network) => {
    try {
      setChosenNetwork(network);
      if (providerNetwork) {
        if (providerNetwork.chainId !== network.value) {
          throw new Error(
            `Provider network ${providerNetwork.chainId}, expected ${network.value}`,
          );
        }
      }
    } catch (error) {
      // eslint-disable-next-line
      console.log({ networkError: error });
    }
  };

  useEffect(() => {
    async function getAccount() {
      try {
        const signer = await ethersProvider.getSigner();
        const gotAccount = await signer.getAddress();
        setAccount(gotAccount);
      } catch (error) {
        // eslint-disable-next-line
        console.log({ accountError: error });
      }
    }
    getAccount();
  }, [ethersProvider]);

  // Uncomment this if we want to automatically connect
  // useEffect(() => {
  //     if (web3Modal.cachedProvider) {
  //         connectWeb3().catch(console.error);
  //     }
  // }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        disconnect,
        network: chosenNetwork,
        setNetwork,
        account,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
