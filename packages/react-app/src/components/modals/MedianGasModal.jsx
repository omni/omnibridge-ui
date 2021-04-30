import { Flex, Image, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import React from 'react';

export const MedianGasModal = props => {
  const { medianPrice, currentGas } = props;
  console.log('Hello');
  console.log(medianPrice);
  console.log(currentGas);
  const percent = currentGas
    .sub(medianPrice)
    .mul(100)
    .div(currentGas)
    .toNumber();
  console.log(percent);

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
      <Flex align="center" fontSize="12px" p={2} pl={4}>
        <Text>
          {`The current gas price on the Ethereum Mainnet is 
			  			${percent}% above the median for the past 7 days`}
        </Text>
      </Flex>
    </Flex>
  );
};
