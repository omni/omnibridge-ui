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
import React from 'react';

export const BridgeDropdown = () => {
  const { bridgeDirection, setBridgeDirection } = useSettings();
  const placement = useBreakpointValue({ base: 'bottom', md: 'bottom-end' });

  return (
    <Menu placement={placement}>
      <MenuButton
        as={Button}
        leftIcon={<NetworkIcon />}
        rightIcon={<DownArrowIcon boxSize="0.5rem" color="black" />}
        color="grey"
        bg="none"
          _hover={{ color: 'blue.500', bgColor: "blackAlpha.100" }}
      >
        <Text color="black" textTransform="uppercase" fontSize="0.9rem">
          {networks[bridgeDirection].label}
        </Text>
      </MenuButton>
      <MenuList border="none" boxShadow="0 0.5rem 1rem #CADAEF">
        {Object.entries(networks).map(([key, { label }]) => (
          <MenuItem
            value={key}
            onClick={e => setBridgeDirection(e.target.value, true)}
            key={key}
            textTransform="uppercase"
            fontWeight="700"
            fontSize="0.9rem"
            justifyContent="center"
          >
            {label}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
