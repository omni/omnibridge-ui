import { Flex, Image, Link, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import { utils } from 'ethers';
import { FOREIGN_CHAIN_ID, HOME_CHAIN_ID } from 'lib/constants';
import { getEthereumPrice } from 'lib/ethPrice';
import { getFastGasPrice } from 'lib/gasPrice';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

const LearnMoreLink = () => (
  <Link
    href="https://www.xdaichain.com/about-xdai/faqs/bridges-xdai-bridge-and-omnibridge#metamask-is-showing-very-high-fees-to-claim-a-transaction-on-ethereum-tokens-bridged-from-xdai-to-ethereum-is-this-estimate-accurate"
    isExternal
    color="blue.400"
  >
    learn more
  </Link>
);

export const NeedsTransactions = () => {
  const GAS_COST = 260000;

  const gasPrice = getFastGasPrice();
  const ethPrice = getEthereumPrice();
  const gasCostInETH = utils.formatEther(gasPrice.mul(GAS_COST));
  const gasCostInUSD = gasCostInETH * ethPrice;

  const gasCostInETHString = Number(gasCostInETH).toFixed(3);
  const gasCostInUSDString = gasCostInUSD.toFixed(2);

  let txCostText = '';
  if (FOREIGN_CHAIN_ID === 1) {
    txCostText = (
      <>
        You will need some xDai and approximately {gasCostInETHString} ETH (
        {gasCostInUSDString} USD) to complete. When claiming, your wallet may
        show a higher, less accurate estimate (<LearnMoreLink />
        ).
      </>
    );
  }

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
          {`The claim process requires 2 transactions, one on ${getNetworkName(
            HOME_CHAIN_ID,
          )} and one
          on ${getNetworkName(FOREIGN_CHAIN_ID)}. `}
          {txCostText}
        </Text>
      </Flex>
    </Flex>
  );
};
