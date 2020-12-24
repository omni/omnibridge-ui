import WalletConnectProvider from '@walletconnect/web3-provider';
import ethers from 'ethers';
import React, { useCallback, useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

import { CONFIG } from '../config';
import { networkOptions } from '../lib/constants';
import { getNetworkName } from '../lib/helpers';

export const Web3Context = React.createContext({});

const updateTitle = chainId => {
  const networkName = getNetworkName(chainId);
  const defaultTitle = 'OmniBridge';
  if (!process.env.REACT_APP_TITLE) {
    document.title = defaultTitle;
  } else {
    const titleReplaceString = '%c';
    const appTitle = process.env.REACT_APP_TITLE || defaultTitle;

    if (appTitle.indexOf(titleReplaceString) !== -1) {
      document.title = appTitle.replace(titleReplaceString, networkName);
    } else {
      document.title = appTitle;
    }
  }
};

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
  const [ethersProvider, setEthersProvider] = useState();
  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(true);

  const setWeb3Provider = async (prov, updateAccount = false) => {
    if (prov) {
      const web3Provider = new Web3(prov);
      const provider = new ethers.providers.Web3Provider(
        web3Provider.currentProvider,
      );

      setEthersProvider(provider);
      const providerNetwork = await provider.getNetwork();
      setProviderChainId(providerNetwork.chainId);
      if (updateAccount) {
        const signer = provider.getSigner();
        const gotAccount = await signer.getAddress();
        setAccount(gotAccount);
      }
    }
  };

  useEffect(() => {
    if (providerChainId) {
      updateTitle(providerChainId);
    }
  }, [providerChainId]);

  const connectWeb3 = useCallback(async () => {
    try {
      setLoading(true);
      const modalProvider = await web3Modal.connect();

      await setWeb3Provider(modalProvider, true);

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
    setLoading(false);
  }, []);

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
    } else {
      setLoading(false);
    }
  }, [connectWeb3]);
  const network = networkOptions.find(n => n.value === providerChainId);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        loading,
        disconnect,
        providerChainId,
        account,
        network,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
