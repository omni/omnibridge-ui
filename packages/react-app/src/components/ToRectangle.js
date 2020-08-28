import * as React from "react";
import { Flex } from "@chakra-ui/core";

function ToRectangle(props) {
    return (
        <Flex align="center" ml={{ base: -4, md: -4, xl: -6 }}>
            <svg width="100%" viewBox="0 0 381 94" fill="none" {...props}>
                <path
                    d="M20.806 4.484A8 8 0 0127.992 0H373a8 8 0 018 8v78a8 8 0 01-8 8H27.992a8 8 0 01-7.186-4.484l-19.085-39a8 8 0 010-7.032l19.085-39z"
                    fill="#EEF4FD"
                />
            </svg>
        </Flex>
    );
}

export default ToRectangle;
