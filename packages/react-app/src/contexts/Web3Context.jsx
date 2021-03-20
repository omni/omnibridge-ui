import WalletConnectProvider from '@walletconnect/web3-provider';
import { ethers } from 'ethers';
import {
  fetchQueryParams,
  getNetworkName,
  getRPCUrl,
  logError,
} from 'lib/helpers';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import Web3Modal from 'web3modal';

export const Web3Context = React.createContext({});
export const useWeb3Context = () => useContext(Web3Context);

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
      rpc: {
        1: getRPCUrl(1),
        42: getRPCUrl(42),
        100: getRPCUrl(100),
        77: getRPCUrl(77),
        56: getRPCUrl(56),
      },
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions,
});

export const Web3Provider = ({ children }) => {
  const [web3State, setWeb3State] = useState({});
  const { providerChainId, ethersProvider } = web3State;
  const [account, setAccount] = useState();
  const [loading, setLoading] = useState(true);
  const [isChainIdInjected, setIsChainIdInjected] = useState({
    status: false,
    chainId: null,
  });

  const [isTokenInjected, setIsTokenInjected] = useState({
    status: false,
    token: null,
  });

  const setWeb3Provider = useCallback(async (prov, updateAccount = false) => {
    try {
      if (prov) {
        const web3Provider = new Web3(prov);
        const provider = new ethers.providers.Web3Provider(
          web3Provider.currentProvider,
        );

        setWeb3State({
          ethersProvider: provider,
          providerChainId: Number(prov.chainId),
        });
        if (updateAccount) {
          const signer = provider.getSigner();
          const gotAccount = await signer.getAddress();
          setAccount(gotAccount);
        }
      }
    } catch (error) {
      logError({ web3ModalError: error });
    }
  }, []);

  useEffect(() => {
    if (providerChainId) {
      updateTitle(providerChainId);
    }
  }, [providerChainId]);

  const connectWeb3 = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = fetchQueryParams();

      if (queryParams?.from) {
        setIsChainIdInjected({
          status: true,
          chainId: parseInt(queryParams.from, 10),
        });
      }

      if (queryParams?.token) {
        setIsTokenInjected({
          status: true,
          token: queryParams.token.toLowerCase(),
        });
      }

      const modalProvider = await web3Modal.connect();

      await setWeb3Provider(modalProvider, true);

      // Subscribe to accounts change
      modalProvider.on('accountsChanged', accounts => {
        setAccount(accounts[0]);
      });

      // Subscribe to chainId change
      modalProvider.on('chainChanged', _chainId => {
        setWeb3Provider(modalProvider);
      });
    } catch (error) {
      logError({ web3ModalError: error });
    }
    setLoading(false);
  }, [setWeb3Provider]);

  const disconnect = useCallback(async () => {
    web3Modal.clearCachedProvider();
    setAccount();
    setWeb3State({});
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.autoRefreshOnNetworkChange = false;
    }
    if (web3Modal.cachedProvider) {
      connectWeb3();
    } else {
      setLoading(false);
    }
  }, [connectWeb3]);

  return (
    <Web3Context.Provider
      value={{
        ethersProvider,
        connectWeb3,
        loading,
        disconnect,
        providerChainId,
        account,
        isChainIdInjected,
        isTokenInjected,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
