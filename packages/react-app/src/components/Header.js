import React, { useContext, useState, useEffect } from "react";
import Web3Context from "../lib/Web3Context";
import { HStack, Flex, Button, Text, Image } from "@chakra-ui/core";
import Logo from "../assets/logo.svg";
import { WalletIcon } from "../icons/WalletIcon";
import { HistoryIcon } from "../icons/HistoryIcon";
import { NetworkSelector, networkOptions } from "./NetworkSelector";

const getAccountString = account => {
    const len = account.length;
    return account.substr(0, 6) + "..." + account.substr(len - 4, len - 1);
};

export const Header = () => {
    const { ethersProvider, connectWeb3 } = useContext(Web3Context);
    const [account, setAccount] = useState();
    // eslint-disable-next-line
    const [network, setNetwork] = useState(networkOptions[0]);
    useEffect(() => {
        async function getAccount() {
            try {
                const signer = await ethersProvider.getSigner();
                const gotAccount = await signer.getAddress();
                setAccount(gotAccount);
            } catch (error) {
                console.log({ accountError: error });
            }
        }
        getAccount();
    }, [ethersProvider]);

    return (
        <Flex
            justify="space-between"
            align="center"
            h={20}
            maxW={"75rem"}
            px={4}
            w={"100%"}
            zIndex={1}
        >
            <Flex justify="space-around" align="center">
                <Image src={Logo} mr={4} />
                <Text fontWeight="bold">Multi Token Bridge</Text>
            </Flex>
            <HStack spacing={4}>
                <Flex align="center" px={4} fontWeight="bold">
                    <HistoryIcon color="grey" mr={2} />
                    History
                </Flex>
                <Flex>
                    {!account && (
                        <Button onClick={connectWeb3} colorScheme="blue">
                            <WalletIcon mr={2} />
                            Connect Wallet
                        </Button>
                    )}
                    {account && (
                        <Button colorScheme="blue">
                            <WalletIcon mr={2} />
                            <Text> {getAccountString(account)} </Text>
                        </Button>
                    )}
                </Flex>
                <Flex>
                    <NetworkSelector
                        onChange={_network => setNetwork(_network)}
                    />
                </Flex>
            </HStack>
        </Flex>
    );
};
