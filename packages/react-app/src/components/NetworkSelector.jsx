import { Flex, Text } from '@chakra-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import Select, { components } from 'react-select';

import { networkOptions } from '../constants';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { BridgeContext } from '../lib/BridgeContext';
import { Web3Context } from '../lib/Web3Context';

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

export const NetworkSelector = () => {
  const [localNetwork, setLocalNetwork] = useState(0);
  const { setNetwork } = useContext(Web3Context);
  const { setDefaultToken } = useContext(BridgeContext);

  useEffect(() => {
    let storageNetwork = parseInt(
      window.localStorage.getItem('chosenNetwork'),
      10,
    );
    if (!isNaN(storageNetwork)) {
      storageNetwork %= networkOptions.length;
      setDefaultToken(networkOptions[storageNetwork].value);
      setLocalNetwork(storageNetwork);
      setNetwork(networkOptions[storageNetwork]);
    }
  }, [setNetwork, setDefaultToken]);

  const onChange = (network) => {
    setDefaultToken(network.value);
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
