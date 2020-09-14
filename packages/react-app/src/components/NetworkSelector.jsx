import {
  Button,
  Flex,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/core';
import React, { useContext, useEffect, useState } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { networkOptions } from '../lib/constants';

const SelectOption = props => {
  const { onChange, network } = props;
  const { icon, label } = network;

  return (
    <Flex color="grey" transition="0.25s">
      <Button
        background="transparent"
        width="100%"
        justifyContent="flex-start"
        _hover={{ color: 'blue.500', background: 'gray.100', zIndex: 4 }}
        onClick={() => onChange(network)}
      >
        {icon}
        <Text color="black" ml={2}>
          {label}
        </Text>
      </Button>
    </Flex>
  );
};

const DropdownIndicator = props => {
  return (
    <Flex align="center" justify="center" paddingLeft="15px">
      <DownArrowIcon fontSize={8} color="black" />
    </Flex>
  );
};

const SelectValue = ({ icon, label }) => (
  <Flex
    cursor="pointer"
    color="grey"
    transition="0.25s"
    padding="2px 8px"
    _hover={{ color: 'blue.500' }}
  >
    {icon}
    <Text color="black" ml={2} fontWeight="normal">
      {label}
    </Text>
    <DropdownIndicator />
  </Flex>
);

export const NetworkSelector = props => {
  const [localNetwork, setLocalNetwork] = useState(0);
  const { setNetwork } = useContext(Web3Context);
  const { setDefaultToken } = useContext(BridgeContext);

  const [isOpen, setIsOpen] = React.useState(false);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    let storageNetwork = parseInt(
      window.localStorage.getItem('chosenNetwork'),
      10,
    );
    if (isNaN(storageNetwork)) {
      storageNetwork = 0;
    } else {
      storageNetwork %= networkOptions.length;
    }
    setDefaultToken(networkOptions[storageNetwork].value);
    setLocalNetwork(storageNetwork);
    setNetwork(networkOptions[storageNetwork]);
  }, [setNetwork, setDefaultToken]);

  const onChange = network => {
    close();
    setDefaultToken(network.value);
    setNetwork(network);
    setLocalNetwork(network.key);
    window.localStorage.setItem('chosenNetwork', network.key);
  };

  const currentNetwork = networkOptions[localNetwork];
  const selectOptions = networkOptions
    .filter(network => currentNetwork.value !== network.value)
    .map(network => {
      return (
        <SelectOption
          onChange={onChange}
          network={network}
          key={network.key.toString()}
        />
      );
    });

  const handleOpen = isOpen ? close : open;

  return (
    <Flex {...props}>
      <Popover isOpen={isOpen} placement="bottom">
        <PopoverTrigger>
          <Button
            p={0}
            _hover={{ background: 'transparent' }}
            onClick={handleOpen}
          >
            <SelectValue {...currentNetwork} />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          zIndex={4}
          width="min-content"
          border="1px solid rgba(226,232,240, 0.8)"
          boxShadow="0 0.5rem 1rem #CADAEF"
        >
          <PopoverBody padding={0}>{selectOptions}</PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};
