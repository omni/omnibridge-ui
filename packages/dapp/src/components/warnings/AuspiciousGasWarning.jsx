import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useGasPrice } from 'hooks/useGasPrice';
import React from 'react';

export const AuspiciousGasWarning = ({
  noShadow = false,
  noMargin = false,
}) => {
  const { foreignChainId } = useBridgeDirection();
  const { currentPrice, medianPrice, lowestPrice } = useGasPrice();

  if (
    foreignChainId === 1 &&
    lowestPrice.gt(0) &&
    medianPrice.gt(0) &&
    medianPrice.gt(currentPrice)
  ) {
    const medianPercent = medianPrice
      .sub(currentPrice)
      .mul(100)
      .div(medianPrice)
      .toNumber();

    const lowestPercent = currentPrice
      .sub(lowestPrice)
      .mul(100)
      .div(currentPrice)
      .toNumber();

    let msg = `${medianPercent}% below the median`;

    if (lowestPrice.gte(currentPrice)) {
      msg = 'the lowest';
    } else if (currentPrice.lte(medianPrice.sub(medianPrice.div(4)))) {
      msg = `${lowestPercent}% above the lowest`;
    }

    return (
      <Flex
        align="center"
        direction="column"
        w="100%"
        mb={noMargin ? '0' : '4'}
      >
        <Alert
          status="info"
          borderRadius={5}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          <Text fontSize="small">
            {`The current gas price on the Ethereum Mainnet is `}
            <b>{msg}</b>
            {` for the past 7 days`}
          </Text>
        </Alert>
      </Flex>
    );
  }
  return null;
};
