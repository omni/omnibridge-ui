import { Badge, Image, Text, Tooltip } from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { useWeb3Context } from 'contexts/Web3Context';
import { useSwitchChain } from 'hooks/useSwitchChain';
import { getNetworkName } from 'lib/helpers';
import React, { useCallback } from 'react';

export const useRenderChain = () => {
  const { isMetamask } = useWeb3Context();

  const switchChain = useSwitchChain();

  const renderChain = useCallback(
    (chainId, connect = true) => {
      const networkName = getNetworkName(chainId);

      return isMetamask && connect ? (
        <Tooltip label={`Click to switch to ${networkName}`} position="auto">
          <Badge
            display="inline-flex"
            alignItems="center"
            py={1}
            px={2}
            m={1}
            borderRadius={5}
            size="1"
            cursor="pointer"
            colorScheme="blue"
            onClick={() => switchChain(chainId)}
          >
            <Image boxSize={5} src={MetamaskFox} mr={2} />
            {networkName}
          </Badge>
        </Tooltip>
      ) : (
        <Text
          as="span"
          fontWeight="bold"
          textTransform="uppercase"
          fontSize="0.9rem"
          color="black"
        >
          {' '}
          {networkName}
        </Text>
      );
    },
    [switchChain, isMetamask],
  );

  return renderChain;
};
