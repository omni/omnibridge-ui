import { Flex, Text } from '@chakra-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Select, { components } from 'react-select';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { networkOptions } from '../lib/constants';

const { Option, DropdownIndicator } = components;

const CustomSelectOption = props => {
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

const CustomDropdownIndicator = props => {
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
  control: provided => ({
    ...provided,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    fontWeight: 'bold',
    paddingLeft: '0.5rem',
  }),
  menu: provided => ({
    ...provided,
    boxShadow: '0 0.5rem 1rem #CADAEF',
    backgroundColor: 'white',
  }),
  indicatorSeparator: provided => ({
    ...provided,
    backgroundColor: 'transparent',
  }),
};

export const NetworkSelector = props => {
  const [localNetwork, setLocalNetwork] = useState(0);
  const { setNetwork } = useContext(Web3Context);
  const { setDefaultToken } = useContext(BridgeContext);

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
    setDefaultToken(network.value);
    setNetwork(network);
    setLocalNetwork(network.key);
    window.localStorage.setItem('chosenNetwork', network.key);
  };

  return (
    <Flex {...props}>
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
    </Flex>
  );
};
