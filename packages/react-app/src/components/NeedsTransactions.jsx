import { Flex, Image, Text } from '@chakra-ui/react';
import { utils } from 'ethers';
import React from 'react';

import AlertImage from '../assets/alert.svg';
import { getEthereumPrice } from '../lib/ethPrice';
import { getFastGasPrice } from '../lib/gasPrice';

export const NeedsTransactions = () => {
  const GAS_COST = 260000;

  const gasPrice = getFastGasPrice();
  const ethPrice = getEthereumPrice();
  const gasCostInETH = utils.formatEther(gasPrice.mul(GAS_COST));
  const gasCostInUSD = gasCostInETH * ethPrice;

  const gasCostInETHString = Number(gasCostInETH).toFixed(3);
  const gasCostInUSDString = gasCostInUSD.toFixed(2);

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
      <Flex align="center" fontSize="12px" p={4}>
        <Text>
          The claim process requires 2 transactions, one on xDai chain and one
          on ETH Mainnet. You will need some xDai and approximately{' '}
          {gasCostInETHString} ETH ({gasCostInUSDString} USD) to complete.
        </Text>
      </Flex>
    </Flex>
  );
};
