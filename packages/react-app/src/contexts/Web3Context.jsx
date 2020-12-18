import WalletConnectProvider from '@walletconnect/web3-provider';
import ethers from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { CONFIG } from '../config';
import { networkOptions } from '../lib/constants';

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
  cacheProvider: true,
  providerOptions,
});

export const Web3Provider = ({ children }) => {
  const [providerChainId, setProviderChainId] = useState();
  const [chosenNetwork, setChosenNetwork] = useState(networkOptions[0]);
  const [ethersProvider, setEthersProvider] = useState();
  const [account, setAccount] = useState();
  const [networkMismatch, setNetworkMismatch] = useState(false);

  const setWeb3Provider = async (prov, updateAccount = false) => {
    if (prov) {
      const web3Provider = new Web3(prov);
      const provider = new ethers.providers.Web3Provider(
        web3Provider.currentProvider,
      );

      setEthersProvider(provider);
      const network = await provider.getNetwork();
      setProviderChainId(network.chainId);
      if (updateAccount) {
        const signer = provider.getSigner();
        const gotAccount = await signer.getAddress();
        setAccount(gotAccount);
      }
    }
  };

  const connectWeb3 = useCallback(async () => {
    try {
      const modalProvider = await web3Modal.connect();

      setWeb3Provider(modalProvider, true);

      // Subscribe to accounts change
      modalProvider.on('accountsChanged', accounts => {
        window.sessionStorage.setItem('claimTokens', 0);
        setAccount(accounts[0]);
      });

      // Subscribe to chainId change
      modalProvider.on('chainChanged', _chainId => {
        window.sessionStorage.setItem('claimTokens', 0);
        setWeb3Provider(modalProvider);
      });
    } catch (error) {
      // eslint-disable-next-line
      console.log({ web3ModalError: error });
    }
  }, []);

  useEffect(() => {
    if (chosenNetwork && providerChainId === chosenNetwork.value) {
      setNetworkMismatch(false);
    } else {
      setNetworkMismatch(true);
    }
  }, [chosenNetwork, providerChainId]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setAccount();
    setEthersProvider();
    setProviderChainId();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    if (web3Modal.cachedProvider) {
      connectWeb3().catch(error => {
        // eslint-disable-next-line
        console.error({ web3ModalError: error });
      });
    }
  }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        disconnect,
        providerChainId,
        network: chosenNetwork,
        setNetwork: setChosenNetwork,
        account,
        networkMismatch,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
