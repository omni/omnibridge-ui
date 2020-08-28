import * as React from "react";
import { Flex } from "@chakra-ui/core";

function FromRectangle(props) {
    return (
        <Flex align="center" mr="-1rem">
            <svg width="100%" viewBox="0 0 381 94" fill="none" {...props}>
                <path
                    d="M359.745 4.703A7.5 7.5 0 00353.008.5H8A7.5 7.5 0 00.5 8v78A7.5 7.5 0 008 93.5h345.008a7.5 7.5 0 006.737-4.203l19.085-39a7.499 7.499 0 000-6.594l-19.085-39z"
                    fill="#fff"
                    stroke="#DAE3F0"
                />
            </svg>
        </Flex>
    );
}

export default FromRectangle;
