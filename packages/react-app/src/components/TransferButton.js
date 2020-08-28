import * as React from "react";
import { Flex, Text, Image } from "@chakra-ui/core";
import TransferIcon from "../assets/transfer.svg";

function TransferButton(props) {
    return (
        <Flex
            align="center"
            mt={{base: 2, md: 2, lg: 3}}
            color="blue.500"
            _hover={{ color: "blue.600" }}
            cursor="pointer"
            transition="0.25s"
            position="relative"
        >
            <svg width="100%" viewBox="0 0 156 42" fill="none" {...props}>
                <path
                    d="M16.914 2.28A4 4 0 0120.526 0h114.948a4 4 0 013.612 2.28l16.19 34c1.264 2.655-.671 5.72-3.611 5.72H4.335C1.395 42-.54 38.935.724 36.28l16.19-34z"
                    fill="currentColor"
                />
            </svg>
            <Flex position="absolute" w="100%" h="100%" justify="center" align="center">
                <Text color="white" fontWeight="bold">Transfer</Text>
                <Image src={TransferIcon} ml={2}/>
            </Flex>
        </Flex>
    );
}

export default TransferButton;
