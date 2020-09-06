import {
  Button,
  Flex,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/core';
import { utils } from 'ethers';
import React, { useContext, useState } from 'react';

import xDAILogo from '../assets/xdai-logo.png';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { fetchTokenDetails } from '../lib/token';


export const CustomTokenModal = ({ isOpen, onClose }) => {
  const { setToken } = useContext(
    BridgeContext,
  );
  const { network } = useContext(Web3Context);
  const [customToken, setCustomToken] = useState({
    address: '',
    name: '',
    symbol: '',
    decimals: 0,
    chainId: network.value,
    logo: xDAILogo
  });

  const onClick = () => {
    onClose();
    addCustomToken();
  };

  const addCustomToken = () => {
    let localTokensList = window.localStorage.getItem('customTokens')
    let customTokensList = [];

    if (localTokensList === "") { localTokensList = [] }
    if (localTokensList.length < 1) {
      customTokensList = localTokensList.concat([customToken])
    } else {
      customTokensList = JSON.parse(localTokensList)
      customTokensList.push(customToken)
    }
    window.localStorage.setItem('customTokens', JSON.stringify(customTokensList))
    setToken(customToken);
  }

  const handleChange = async e => {

    if (e.target.id === 'address' && utils.isAddress(e.target.value)) {
      const tokenAddress = e.target.value
      const customTokenDetails = await fetchTokenDetails(network.value, tokenAddress)
      setCustomToken({
        ...customToken,
        address: tokenAddress,
        name: customTokenDetails.name,
        symbol: customTokenDetails.symbol,
        decimals: customTokenDetails.decimals
      })
    } else {
      setCustomToken({...customToken, [e.target.id]: e.target.value})
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="30rem"
        >
          <ModalHeader p={6}>
            <Text>Add Custom Token</Text>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            _focus={{ border: 'none', outline: 'none' }}
          />
          <ModalBody px={6} py={0}>
            <Flex flexDirection="column">
              <Text mb={2}>
                Token Contract Address
              </Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="address"
                  placeholder="0xAbC ..."
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={customToken.address}
                />
              </InputGroup>
              <Text mb={2}>
                Token Symbol
              </Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="symbol"
                  placeholder="ETH"
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={customToken.symbol}
                />
              </InputGroup>
              <Text mb={2}>
                Decimals of Precision
              </Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="decimals"
                  placeholder="18"
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={customToken.decimals}
                />
              </InputGroup>
            </Flex>
          </ModalBody>
          <ModalFooter p={6}>
            <Flex w="100%" justify="space-between" align="center">
              <Button
                px={12}
                onClick={onClose}
                background="background"
                _hover={{ background: '#bfd3f2' }}
                color="#687D9D"
              >
                Cancel
              </Button>
              <Button px={12} onClick={onClick} colorScheme="blue">
                Add Token
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
