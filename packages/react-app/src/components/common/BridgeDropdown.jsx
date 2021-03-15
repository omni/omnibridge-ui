import { ChevronDownIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { Web3Context } from 'contexts/Web3Context';
import { bridgeNames } from 'lib/constants';
import { getBridgeName, getBridgeNetwork, getBridgeUrl } from 'lib/helpers';
import React, { useContext, useState } from 'react';

export const BridgeDropdown = () => {
  const { providerChainId: chainId } = useContext(Web3Context);
  const bridgeChainId = getBridgeNetwork(chainId);
  const defaultBridgeUrl = getBridgeUrl(`${chainId}-${bridgeChainId}`);
  const defaultBridgeName = getBridgeName(defaultBridgeUrl);
  const [bridgeName, setBridgeName] = useState(defaultBridgeName);

  const changeItem = e => {
    setBridgeName(e.target.name);
    window.location.href = e.target.dataset.url;
  };

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
        {bridgeName}
      </MenuButton>
      <MenuList>
        {Object.entries(bridgeNames).map(([url, name]) => (
          <MenuItem name={name} data-url={url} onClick={changeItem}>
            {name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
