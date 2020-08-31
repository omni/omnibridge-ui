import React, { useState, useEffect, useContext } from "react";
import ethers from "ethers";
import Web3Context from "../lib/Web3Context";
import {
    Button,
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
    Text
} from "@chakra-ui/core";
import xDAILogo from "../assets/xdai-logo.png";
import SearchIcon from "../assets/search.svg";
import { PlusIcon } from "../icons/PlusIcon";
import { fetchBalance } from "../lib/helpers";
import { getTokenList } from "../lib/tokenList";

const TokenSelector = ({ isOpen, onClose, setToken }) => {
    const { network, ethersProvider, account } = useContext(Web3Context);
    const [tokenList, setTokenList] = useState();
    const [filteredTokenList, setFilteredTokenList] = useState([]);

    const onClick = token => {
        setToken({
            ...token,
            logo: token.logo,
            balanceInUsd: "0"
        });
        onClose();
    };

    const onChange = e => {
        const newFilteredTokenList = tokenList
            .filter(token => {
                const lowercaseSearch = e.target.value.toLowerCase();
                return (
                    token.name.toLowerCase().includes(lowercaseSearch) ||
                    token.symbol.toLowerCase().includes(lowercaseSearch)
                );
            })
            .map(token => ({ ...token, logo: xDAILogo }));
        setFilteredTokenList(newFilteredTokenList);
    };

    useEffect(() => {
        async function fetchTokenList() {
            try {
                const gotTokenList = await getTokenList(network.value);
                console.log({gotTokenList});
                const newFilteredTokenList = await Promise.all(
                    gotTokenList.map(async token => ({
                        ...token,
                        logo: xDAILogo,
                        balance: await fetchBalance(
                            ethersProvider,
                            account,
                            token.address
                        )
                    }))
                );
                setFilteredTokenList(newFilteredTokenList);
                setTokenList(newFilteredTokenList);
            } catch (e) {
                // TODO handle error better
                throw e;
            }
        }
        fetchTokenList();
    }, [network]);

    const inputRef = React.useRef();
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
            initialFocusRef={inputRef}
            isCentered
        >
            <ModalOverlay background="modalBG">
                <ModalContent
                    boxShadow="0px 1rem 2rem #617492"
                    borderRadius="1rem"
                    pb={4}
                    pt={2}
                    w="50%"
                >
                    <ModalHeader pb={0}>
                        <Flex align="center" justify="space-between">
                            Select a Token
                            <Link
                                fontSize="md"
                                color="blue.500"
                                fontWeight="normal"
                            >
                                <Flex align="center">
                                    <PlusIcon mr={2} />
                                    <Text>Add Custom Token</Text>
                                </Flex>
                            </Link>
                        </Flex>
                    </ModalHeader>
                    <ModalCloseButton
                        size="lg"
                        top={-10}
                        right={-10}
                        color="white"
                    />
                    <ModalBody>
                        <Text color="grey" mb={2}>
                            Search Name or Paste Token Contract Address
                        </Text>
                        <InputGroup mb={4} borderColor="#DAE3F0">
                            <Input
                                placeholder="Search ..."
                                size="sm"
                                ref={inputRef}
                                onChange={onChange}
                                _placeholder={{ color: "grey" }}
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
                                key={token.symbol}
                                onClick={() => onClick(token)}
                                mb={2}
                                px={4}
                            >
                                <Flex
                                    align="center"
                                    width="100%"
                                    justify="space-between"
                                >
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
                                                src={token.logo}
                                                alt="xdai"
                                            />
                                        </Flex>
                                        <Text
                                            fontSize="lg"
                                            fontWeight="bold"
                                            mx={2}
                                        >
                                            {token.symbol}
                                        </Text>
                                    </Flex>
                                    <Text color="grey" fontWeight="normal">
                                        {ethers.utils.formatEther(token.balance)}
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

export default TokenSelector;
