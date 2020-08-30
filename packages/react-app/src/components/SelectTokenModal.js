import React, { useState, useEffect } from 'react';
import {
    Box,
    Flex,
    Link,
    Image,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Spacer,
    Text,
} from '@chakra-ui/core';
import xDAILogo from '../assets/xdai-logo.png';
import { SearchIcon } from '@chakra-ui/icons';

export default ({ isOpen, onClose, tokenList, setToken }) => {
    const [filteredTokenList, setFilteredTokenList] = useState([]);

    const onClick = (token) => {
        setToken({
            ...token,
            logo: token.logo,
            balance: '390.0',
            balanceInUsd: '0',
        });
        onClose();
    };

    const onChange = (e) => {
        const newFilteredTokenList = tokenList
            .filter((token) => {
                const lowercaseSearch = e.target.value.toLowerCase();
                return (
                    token.name.toLowerCase().includes(lowercaseSearch) ||
                    token.symbol.toLowerCase().includes(lowercaseSearch)
                );
            })
            .map((token) => ({ ...token, logo: xDAILogo }));
        setFilteredTokenList(newFilteredTokenList);
    };

    useEffect(() => {
        const newFilteredTokenList =
            (tokenList && tokenList.map((token) => ({ ...token, logo: xDAILogo }))) || [];
        setFilteredTokenList(newFilteredTokenList);
    }, [tokenList]);

    const inputRef = React.useRef();
    return (
        <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside" initialFocusRef={inputRef}>
            <ModalOverlay>
                <ModalContent>
                    <ModalHeader>
                        <Flex align="space-between" justify="center">
                            Select a Token
                            <Spacer />
                            <Link fontSize="md" margin="auto" marginRight="20px" color="blue.500">
                                + Add Custom Token
                            </Link>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Text fontSize="md">Search Name or Paste Token Contract Address</Text>
                        <InputGroup margin="15px 0px" borderColor="#DAE3F0">
                            <Input placeholder="Search ..." ref={inputRef} onChange={onChange} />
                            <InputRightElement children={<SearchIcon />} />
                        </InputGroup>
                        {filteredTokenList.map((token) => (
                            <Box
                                as="button"
                                width="385px"
                                display="block"
                                margin="5px 0px"
                                padding="10px"
                                border="1px solid #DAE3F0"
                                borderRadius="5px"
                                key={token.symbol}
                                onClick={() => onClick(token)}
                            >
                                <Flex align="center">
                                    <Flex align="center">
                                        <Flex
                                            justify="center"
                                            align="center"
                                            background="white"
                                            border="1px solid #DAE3F0"
                                            boxSize={8}
                                            overflow="hidden"
                                            borderRadius="50%"
                                        >
                                            <Image src={token.logo} alt="xdai" />
                                        </Flex>
                                        <Text fontSize="lg" fontWeight="bold" mx={2}>
                                            {token.symbol}
                                        </Text>
                                    </Flex>
                                    <Spacer />
                                    <Box>0.0</Box>
                                </Flex>
                            </Box>
                        ))}
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </Modal>
    );
};
