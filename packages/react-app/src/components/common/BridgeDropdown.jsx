import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useSettings } from 'contexts/SettingsContext';
import { NetworkIcon } from 'icons/NetworkIcon';
import { networks } from 'lib/networks';
import React from 'react';

export const BridgeDropdown = () => {
  const { bridgeDirection, setBridgeDirection } = useSettings();
  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });

  return (
    <Menu placement={placement}>
      <MenuButton as={Button} leftIcon={<NetworkIcon color="grey" />}>
        {networks[bridgeDirection].label}
      </MenuButton>
      <MenuList border="none" boxShadow="0 0.5rem 1rem #CADAEF">
        {Object.entries(networks).map(([key, { label }]) => (
          <MenuItem
            value={key}
            onClick={e => setBridgeDirection(e.target.value, true)}
            key={key}
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
