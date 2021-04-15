import { Flex, Image, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import React from 'react';

export const MedianGasModal = props => {
  const { medianPrice, currentGas } = props;
  const percent = medianPrice / currentGas;

  return (
    <Flex mt={4} w="100%" borderRadius="4px" border="1px solid #DAE3F0">
      <Flex
        bg="#FFF7EF"
        borderLeftRadius="4px"
        border="1px solid #FFAA5C"
        justify="center"
        align="center"
        minW="4rem"
        flex={1}
      >
        <Image src={AlertImage} />
      </Flex>
      <Text>
        {`The current gas price on the Ethereum Mainnet is 
						${percent.toFixed(2)}% above the median for the past 7 days`}
      </Text>
    </Flex>
  );
};
