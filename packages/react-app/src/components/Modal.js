import React, { useRef } from "react";
import { Flex, Box, Text, Image } from "@chakra-ui/core";
import Close from "../assets/close.svg";

export const Modal = ({ close, closable = true, children, ...props }) => {
    const modalRef = useRef(null);

    const handleClick = e => {
        const container = modalRef.current;
        if (closable && !container.contains(e.target)) {
            close();
        }
    };

    return (
        <Flex
            position="fixed"
            top={0}
            left={0}
            height="100%"
            width="100%"
            zIndex={5}
            justify="center"
            align="center"
            background="modalBG"
            onClick={handleClick}
        >
            <Flex
                ref={modalRef}
                background="white"
                boxShadow="0px 1rem 2rem #617492"
                borderRadius="1rem"
                minW="10rem"
                minH="10rem"
                position="relative"
                {...props}
            >
                {closable && (
                    <Image
                        src={Close}
                        position="absolute"
                        top={-8}
                        right={-8}
                        onClick={close}
                        cursor="pointer"
                    />
                )}
                {children}
            </Flex>
        </Flex>
    );
};
