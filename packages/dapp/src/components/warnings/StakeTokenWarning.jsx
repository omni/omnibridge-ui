import { Alert, AlertIcon, Flex, Link, Text } from '@chakra-ui/react';
import React from 'react';

const LearnMoreLink = () => (
  <Link
    href="https://www.xdaichain.com/for-stakers/stake-gno-swap"
    isExternal
    color="blue.400"
  >
    learn more
  </Link>
);

const MAINNET_STAKE_TOKEN =
  '0x0Ae055097C6d159879521C384F1D2123D1f195e6'.toLowerCase();
const XDAI_STAKE_TOKEN =
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e'.toLowerCase();

export const isDisabledStakeToken = token => {
  if (!token) return false;
  const { chainId, address } = token;
  switch (chainId) {
    case 1:
      return address.toLowerCase() === MAINNET_STAKE_TOKEN;
    case 100:
      return address.toLowerCase() === XDAI_STAKE_TOKEN;
    default:
      return false;
  }
};

export const StakeTokenWarning = ({ token, noShadow = false }) =>
  isDisabledStakeToken(token) ? (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="error"
        borderRadius={5}
        boxShadow={noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'}
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          Bridging of STAKE tokens is disabled, please swap your STAKE tokens
          for GNO tokens (<LearnMoreLink />
          ).
        </Text>
      </Alert>
    </Flex>
  ) : null;
