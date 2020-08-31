import { Flex, Image, Text } from '@chakra-ui/core';
import React from 'react';

import LoadingImage from '../assets/loading.svg';

export const Loading = () => {
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
      direction="column"
    >
      <Image src={LoadingImage} mb={4} />
      <Text color="white" fontWeight="bold">
        Loading ...
      </Text>
    </Flex>
  );
};
