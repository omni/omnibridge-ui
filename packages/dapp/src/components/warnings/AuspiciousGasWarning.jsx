import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import React from 'react';

export const AuspiciousGasWarning = ({
  lowestPrice,
  medianPrice,
  currentPrice,
  noShadow = false,
  noMargin = false,
}) => {
  const medianPercent = medianPrice
    .sub(currentPrice)
    .mul(100)
    .div(medianPrice)
    .toNumber();

  let msg = `${medianPercent}% below the median`;
  if (lowestPrice.gte(currentPrice)) {
    msg = 'the lowest';
  } else if (currentPrice.lte(medianPrice.sub(medianPrice.div(4)))) {
    const lowestPercent = currentPrice
      .sub(lowestPrice)
      .mul(100)
      .div(currentPrice)
      .toNumber();
    msg = `${lowestPercent}% above the lowest`;
  }

  return (
    <Flex align="center" direction="column" w="100%" mb={noMargin ? '0' : '4'}>
      <Alert
        status="info"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
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
};
