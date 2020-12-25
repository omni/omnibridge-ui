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
import React, { useContext } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { WalletIcon } from '../icons/WalletIcon';
import { getAccountString } from '../lib/helpers';

export const WalletSelector = props => {
  const { disconnect, account, network } = useContext(Web3Context);

  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });
  return (
    <Flex {...props}>
      <Popover placement={placement}>
        <PopoverTrigger>
          <Button colorScheme="blue">
            <WalletIcon mr={2} />
            <Text> {getAccountString(account)} </Text>
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
              {network.label}
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
                Connected to {network.name}
              </Text>
              <Button colorScheme="blue" onClick={disconnect}>
                <Text> Disconnect </Text>
              </Button>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
