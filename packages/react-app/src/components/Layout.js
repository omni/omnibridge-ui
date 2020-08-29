import React from "react";
import { Flex, Image } from "@chakra-ui/core";
import DownTriangle from "../assets/down-triangle.svg";
import UpTriangle from "../assets/up-triangle.svg";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children }) => (
    <Flex
        p={0}
        m={0}
        overflowX="hidden"
        fontFamily="body"
        w={"100vw"}
        h={"100vh"}
        align="center"
        direction="column"
        background="background"
        position="relative"
    >
        <Image
            src={DownTriangle}
            position="absolute"
            right="min(-15rem, -20%)"
            w="60rem"
            minWidth="30rem"
            opacity={0.99}
        />
        <Image
            src={UpTriangle}
            position="absolute"
            left="min(-27rem, -20%)"
            w="81rem"
            minWidth="60rem"
            opacity={0.99}
        />
        <Header />
        <Flex
            flex={1}
            align="center"
            justify="flex-start"
            direction="column"
            w="100%"
            h="100%"
            position="relative"
        >
            {children}
        </Flex>
        <Footer />
    </Flex>
);
