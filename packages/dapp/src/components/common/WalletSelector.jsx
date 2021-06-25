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
import { useWeb3Context } from 'contexts/Web3Context';
import { WalletIcon } from 'icons/WalletIcon';
import { getAccountString, getNetworkLabel, getNetworkName } from 'lib/helpers';
import React from 'react';

export const WalletSelector = ({ close }) => {
  const { disconnect, account, providerChainId } = useWeb3Context();

  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });
  if (!account || !providerChainId) return null;
  return (
    <Flex>
      <Popover placement={placement}>
        <PopoverTrigger>
          <Button colorScheme="blue" px={3} leftIcon={<WalletIcon />}>
            <Text fontSize="sm"> {getAccountString(account)} </Text>
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
            <Flex
              justify="space-between"
              align="center"
              direction="column"
              fontWeight="bold"
            >
              <Text mb={{ base: 4, md: undefined }}>
                Connected to {getNetworkName(providerChainId)}
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => {
                  disconnect();
                  close();
                }}
              >
                <Text> Disconnect </Text>
              </Button>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
