import * as React from "react";
import { Flex, Text, Image } from "@chakra-ui/core";
import UnlockIcon from "../assets/unlock.svg";

function UnlockButton(props) {
    return (
        <Flex
            align="center"
            color="cyan.500"
            _hover={{ color: "cyan.600" }}
            cursor="pointer"
            transition="0.25s"
            position="relative"
        >
            <svg width="100%" viewBox="0 0 156 42" fill="none" {...props}>
                <path
                    d="M139.086 39.72a4 4 0 01-3.612 2.28H20.526a4 4 0 01-3.612-2.28l-16.19-34C-.54 3.065 1.395 0 4.335 0h147.33c2.94 0 4.875 3.065 3.611 5.72l-16.19 34z"
                    fill="currentColor"
                />
            </svg>
            <Flex
                position="absolute"
                w="100%"
                h="100%"
                justify="center"
                align="center"
            >
                <Text color="white" fontWeight="bold">
                    Unlock
                </Text>
                <Image src={UnlockIcon} ml={2}/>
            </Flex>
        </Flex>
    );
}

export default UnlockButton;
