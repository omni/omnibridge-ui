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
            top={0}
            right="min(-15rem, -20%)"
            w="60rem"
            minWidth="30rem"
        />
        <Image
            src={UpTriangle}
            position="absolute"
            bottom={0}
            left="min(-27rem, -20%)"
            w="81rem"
            minWidth="60rem"
        />
        <Header />
        <Flex flex={1} align="center" direction="column">
            {children}
        </Flex>
        <Footer />
    </Flex>
);
