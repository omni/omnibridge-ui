import {
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import React, { useContext, useEffect } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { ErrorIcon } from '../icons/ErrorIcon';
import { WalletIcon } from '../icons/WalletIcon';
import { networkOptions } from '../lib/constants';
import { getNetworkName } from '../lib/helpers';

const getAccountString = account => {
  const len = account.length;
  return `${account.substr(0, 6)}...${account.substr(len - 4, len - 1)}`;
};

export const WalletSelector = props => {
  const {
    connectWeb3,
    disconnect,
    account,
    providerChainId,
    network,
    setNetwork,
    networkMismatch,
  } = useContext(Web3Context);

  const { setDefaultToken } = useContext(BridgeContext);
  const providerNetwork = networkOptions.find(n => n.value === providerChainId);

  useEffect(() => {
    if (providerNetwork) {
      setNetwork(providerNetwork);
      setDefaultToken(providerNetwork.value);
    }
  }, [providerNetwork, setNetwork, setDefaultToken]);

  return (
    <Flex {...props}>
      {!account && (
        <Button onClick={connectWeb3} colorScheme="blue">
          <WalletIcon mr={2} />
          Connect Wallet
        </Button>
      )}
      {account && (
        <Popover placement="bottom-end">
          <PopoverTrigger>
            <Button colorScheme={networkMismatch ? 'red' : 'blue'}>
              {networkMismatch ? (
                <ErrorIcon size={4} mr={2} color="white" />
              ) : (
                <WalletIcon mr={2} />
              )}
              <Text> {getAccountString(account)} </Text>
              {providerNetwork && (
                <Flex
                  justify="center"
                  align="center"
                  bg="white"
                  borderRadius="6px"
                  px="0.75rem"
                  height="2rem"
                  fontSize="sm"
                  color="blue.500"
                  fontWeight="600"
                  ml={4}
                >
                  {providerNetwork.label}
                </Flex>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            boxShadow="0 0.5rem 1rem #CADAEF"
            border="none"
            right={0}
          >
            <PopoverBody width="100%" align="center" p={4}>
              <Flex justify="space-between" align="center">
                {providerNetwork ? (
                  <Text>Connected to {getNetworkName(providerChainId)}</Text>
                ) : (
                  <Text> Incorrect Network </Text>
                )}
                <Button colorScheme="blue" onClick={disconnect}>
                  <Text> Disconnect </Text>
                </Button>
              </Flex>
              {networkMismatch && (
                <Text textAlign="left" mt={4} color="red.500" fontWeight="bold">
                  Please switch wallet to {network.name}
                </Text>
              )}
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </Flex>
  );
};
