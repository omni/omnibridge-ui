import {
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import Davatar from '@davatar/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useENS } from 'hooks/useENS';
import { WalletIcon } from 'icons/WalletIcon';
import { getAccountString, getNetworkLabel } from 'lib/helpers';
import React from 'react';

import { WalletInfo } from './WalletInfo';

export const WalletSelector = ({ close }) => {
  const { account, loading, providerChainId, connectWeb3 } = useWeb3Context();
  const { ensName } = useENS(account);
  const { fromToken } = useBridgeContext();

  const isInvalid =
    !loading &&
    providerChainId &&
    fromToken &&
    fromToken.chainId !== providerChainId;

  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });
  if (!account || !providerChainId)
    return (
      <Button
        colorScheme="blue"
        onClick={connectWeb3}
        leftIcon={<WalletIcon />}
      >
        Connect Wallet
      </Button>
    );
  return (
    <Flex>
      <Popover placement={placement}>
        <PopoverTrigger>
          <Button colorScheme={isInvalid ? 'red' : 'blue'} px={3}>
            <Davatar
              address={account}
              size={20}
              generatedAvatarType="jazzicon"
            />
            <Text fontSize="sm" ml="2">
              {ensName || getAccountString(account)}
            </Text>
            <Flex
              justify="center"
              align="center"
              bg="white"
              borderRadius="6px"
              px={{ base: 3, md: 2, lg: 3 }}
              height="2rem"
              fontSize="sm"
              color="blue.500"
              fontWeight="600"
              ml={3}
            >
              {getNetworkLabel(providerChainId)}
            </Flex>
          </Button>
        </PopoverTrigger>
        <PopoverContent border="none" right={0} p="0">
          <PopoverBody
            width="100%"
            align="center"
            boxShadow="0 0.5rem 1rem #CADAEF"
            p={4}
          >
            <WalletInfo {...{ close }} />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
