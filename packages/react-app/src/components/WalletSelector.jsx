import {
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import React, { useContext } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { ErrorIcon } from '../icons/ErrorIcon';
import { WalletIcon } from '../icons/WalletIcon';
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
    providerNetwork,
    network,
    networkMismatch,
  } = useContext(Web3Context);
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
            </Button>
          </PopoverTrigger>
          <PopoverContent
            boxShadow="0 0.5rem 1rem #CADAEF"
            border="none"
            width="auto"
            // _focus={{ border: 'none', outline: 'none' }}
            right={0}
            maxW="25rem"
          >
            <PopoverBody width="100%" align="center" p={4}>
              <Flex justify="space-between" align="center">
                <Text>
                  {' '}
                  Connected to {getNetworkName(providerNetwork.chainId)}{' '}
                </Text>
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
