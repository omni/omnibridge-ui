import { Flex, Text } from '@chakra-ui/core';
import React, { useEffect, useState } from 'react';
import Select, { components } from 'react-select';

import { DownArrowIcon } from '../icons/DownArrowIcon';
import { NetworkIcon } from '../icons/NetworkIcon';

const { Option, DropdownIndicator } = components;

const CustomSelectOption = (props) => {
  const {
    data: { icon, label },
  } = props;
  return (
    <Option {...props}>
      <Flex
        align="center"
        cursor="pointer"
        color="grey"
        transition="0.25s"
        _hover={{ color: 'blue.500' }}
      >
        {icon}
        <Text color="black" ml={2}>
          {label}
        </Text>
      </Flex>
    </Option>
  );
};

const CustomDropdownIndicator = (props) => {
  return (
    <DropdownIndicator {...props}>
      <Flex align="center" justify="center">
        <DownArrowIcon fontSize={8} color="black" />;
      </Flex>
    </DropdownIndicator>
  );
};

const CustomSelectValue = ({ data: { icon, label } }) => (
  <Flex
    align="center"
    cursor="pointer"
    color="grey"
    transition="0.25s"
    _hover={{ color: 'blue.500' }}
  >
    {icon}
    <Text color="black" ml={2}>
      {label}
    </Text>
  </Flex>
);

const customStyles = {
  control: (provided) => ({
    ...provided,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
  }),
  indicatorSeparator: () => {},
};

export const networkOptions = [
  {
    value: 100,
    key: 0,
    bridge: { chainId: 1, name: 'ETH Mainnet' },
    label: 'xDai',
    name: 'xDai Chain',
    icon: <NetworkIcon />,
  },
  {
    value: 1,
    key: 1,
    bridge: { chainId: 100, name: 'xDai Chain' },
    label: 'Mainnet',
    name: 'ETH Mainnet',
    icon: <NetworkIcon />,
  },
  {
    value: 77,
    key: 2,
    bridge: { chainId: 42, name: 'ETH Kovan' },
    label: 'Sokol',
    name: 'Sokol Chain',
    icon: <NetworkIcon />,
  },
  {
    value: 42,
    key: 3,
    bridge: { chainId: 77, name: 'Sokol Chain' },
    label: 'Kovan',
    name: 'ETH Kovan',
    icon: <NetworkIcon />,
  },
];

export const NetworkSelector = ({ setNetwork }) => {
  const [localNetwork, setLocalNetwork] = useState(0);

  useEffect(() => {
    const network = parseInt(window.localStorage.getItem('chosenNetwork'), 10);
    if (network) {
      const foundNetwork = network % networkOptions.length;
      setLocalNetwork(foundNetwork);
      setNetwork(networkOptions[foundNetwork]);
    }
  }, [setNetwork]);

  const onChange = (network) => {
    setNetwork(network);
    setLocalNetwork(network.key);
    window.localStorage.setItem('chosenNetwork', network.key);
  };

  return (
    <Select
      onChange={onChange}
      styles={customStyles}
      fontWeight="bold"
      defaultValue={networkOptions[localNetwork]}
      value={networkOptions[localNetwork]}
      options={networkOptions}
      isClearable={false}
      isSearchable={false}
      hideSelectedOptions
      components={{
        Option: CustomSelectOption,
        SingleValue: CustomSelectValue,
        DropdownIndicator: CustomDropdownIndicator,
      }}
    />
  );
};
