import {
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
} from '@chakra-ui/core';
import React, { useContext, useEffect, useRef,useState } from 'react';

import EthLogo from '../assets/eth-logo.png';
import SearchIcon from '../assets/search.svg';
import xDAILogo from '../assets/xdai-logo.png';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { PlusIcon } from '../icons/PlusIcon';
import { formatValue, isxDaiChain } from '../lib/helpers';

export const TokenSelectorModal = ({ isOpen, onClose, onCustom }) => {
  const { network } = useContext(Web3Context);
  const { setToken, tokenList, setDefaultTokenList } = useContext(
    BridgeContext,
  );
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const fallbackLogo = isxDaiChain(network.value) ? xDAILogo : EthLogo;

  const onClick = token => {
    setToken(token);
    onClose();
  };

  const initialRef = useRef();

  const onChange = e => {
    const newFilteredTokenList = tokenList.filter(token => {
      const lowercaseSearch = e.target.value.toLowerCase();
      return (
        token.name.toLowerCase().includes(lowercaseSearch) ||
        token.symbol.toLowerCase().includes(lowercaseSearch) ||
        token.address.toLowerCase().includes(lowercaseSearch)
      );
    });
    setFilteredTokenList(newFilteredTokenList);
  };

  useEffect(() => {
    setFilteredTokenList(tokenList);
  }, [tokenList, setFilteredTokenList]);

  useEffect(() => {
    let localTokenList = window.localStorage.getItem('customTokens');
    if (!localTokenList) {
      localTokenList = [];
    }
    if (localTokenList.length < 1) {
      localTokenList = [];
    } else {
      localTokenList = JSON.parse(localTokenList);
    }
    setDefaultTokenList(network.value, localTokenList);
  }, [network, setDefaultTokenList]);

  const smallScreen = useBreakpointValue({ sm: false, base: true });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      isCentered
      initialFocusRef={initialRef}
    >
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          pb={4}
          pt={2}
          maxW="30rem"
          mx={{ base: 12, lg: 0 }}
        >
          <ModalHeader pb={0}>
            <Flex align="center" justify="space-between">
              Select a Token
              <Link
                fontSize="md"
                color="blue.500"
                fontWeight="normal"
                onClick={onCustom}
              >
                <Flex align="center">
                  <PlusIcon mr={2} />
                  <Text>{smallScreen ? 'Custom' : 'Add Custom Token'}</Text>
                </Flex>
              </Link>
            </Flex>
          </ModalHeader>
          <ModalCloseButton size="lg" top={-10} right={-10} color="white" />
          <ModalBody>
            <Text color="grey" mb={2}>
              Search Name or Paste Token Contract Address
            </Text>
            <InputGroup mb={4} borderColor="#DAE3F0">
              <Input
                placeholder="Search ..."
                size="sm"
                onChange={onChange}
                _placeholder={{ color: 'grey' }}
                ref={initialRef}
              />
              <InputRightElement px={0}>
                <Image src={SearchIcon} />
              </InputRightElement>
            </InputGroup>
            {filteredTokenList.map(token => (
              <Button
                variant="outline"
                size="lg"
                width="100%"
                borderColor="#DAE3F0"
                key={token.address}
                onClick={() => onClick(token)}
                mb={2}
                px={4}
              >
                <Flex align="center" width="100%" justify="space-between">
                  <Flex align="center">
                    <Flex
                      justify="center"
                      align="center"
                      background="white"
                      borderColor="1px solid #DAE3F0"
                      boxSize={8}
                      overflow="hidden"
                      borderRadius="50%"
                    >
                      <Image
                        src={token.logoURI || fallbackLogo}
                        fallbackSrc={fallbackLogo}
                      />
                    </Flex>
                    <Text fontSize="lg" fontWeight="bold" mx={2}>
                      {token.symbol}
                    </Text>
                  </Flex>
                  <Text color="grey" fontWeight="normal">
                    {formatValue(token.balance, token.decimals)}
                  </Text>
                </Flex>
              </Button>
            ))}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
