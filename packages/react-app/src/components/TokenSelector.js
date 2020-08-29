import React, { useEffect, useState, useContext } from "react";
import Web3Context from "../lib/Web3Context";
// import { Flex, Box, Text, Image } from "@chakra-ui/core";
import { Modal } from "./Modal";
import { getTokenList } from "../lib/tokenList";

export const TokenSelector = ({ close }) => {
    const { network } = useContext(Web3Context);
    const [tokenList, setTokenList] = useState();

    useEffect(() => {
        async function fetchTokenList() {
            try {
            const gotTokenList = await getTokenList(network.value);
            setTokenList(gotTokenList);
            console.log(gotTokenList);
            } catch (e) {
                // TODO handle error better
                throw e;
            }
        }
        fetchTokenList();
    }, [network]);

    return <Modal close={close}></Modal>;
};
