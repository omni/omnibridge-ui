import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useSettings } from 'contexts/SettingsContext';
import { DownArrowIcon } from 'icons/DownArrowIcon';
import { NetworkIcon } from 'icons/NetworkIcon';
import { networks } from 'lib/networks';
import React, { useCallback, useEffect } from 'react';

export const BridgeDropdown = ({ close }) => {
  const { bridgeDirection, setBridgeDirection } = useSettings();
  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });

  const setItem = useCallback(
    e => {
      setBridgeDirection(e.target.value, true);
      close();
    },
    [close, setBridgeDirection],
  );

  const networkOptions = Object.keys(networks);
  const isValidNetwork = Object.keys(networks).indexOf(bridgeDirection) >= 0;

  const currentBridgeDirection = isValidNetwork
    ? bridgeDirection
    : networkOptions[0];

  useEffect(() => {
    if (!isValidNetwork) {
      setBridgeDirection(networkOptions[0], true);
    }
  }, [isValidNetwork, networkOptions, setBridgeDirection]);

  return (
    <Menu placement={placement}>
      <MenuButton
        as={Button}
        leftIcon={<NetworkIcon />}
        rightIcon={<DownArrowIcon boxSize="0.5rem" color="black" />}
        color="grey"
        bg="none"
        _hover={{ color: 'blue.500', bgColor: 'blackAlpha.100' }}
        p={2}
      >
        <Text color="black" textTransform="uppercase" fontSize="sm">
          {networks[currentBridgeDirection].label}
        </Text>
      </MenuButton>
      <MenuList border="none" boxShadow="0 0.5rem 1rem #CADAEF" zIndex="3">
        {Object.entries(networks).map(([key, { label }]) => (
          <MenuItem
            value={key}
            onClick={setItem}
            key={key}
            textTransform="uppercase"
            fontWeight="700"
            fontSize="sm"
            justifyContent="center"
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
