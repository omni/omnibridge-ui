import {
  Button,
  Flex,
  Grid,
  Image,
  Link,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import React, { useContext } from 'react';

import BlueTickImage from '../assets/blue-tick.svg';
import RightArrowImage from '../assets/right-arrow.svg';
import { Web3Context } from '../contexts/Web3Context';
import { executeSignatures } from '../lib/amb';
import {
  getBridgeNetwork,
  getExplorerUrl,
  getMonitorUrl,
  isxDaiChain,
} from '../lib/helpers';

const { formatUnits } = utils;

const shortenHash = hash =>
  `${hash.slice(0, 6)}...${hash.slice(hash.length - 4, hash.length)}`;

const Tag = ({ bg, txt }) => (
  <Flex
    justify="center"
    align="center"
    bg={bg}
    borderRadius="6px"
    px="0.75rem"
    height="2rem"
    fontSize="sm"
    color="white"
    fontWeight="600"
  >
    {txt}
  </Flex>
);

const networkTags = {
  100: <Tag bg="#4DA9A6" txt="xDai" />,
  1: <Tag bg="#5A74DA" txt="Ethereum" />,
  42: <Tag bg="#5A74DA" txt="Kovan" />,
  77: <Tag bg="#4DA9A6" txt="Sokol" />,
};

const getNetworkTag = chainId => networkTags[chainId];

export const HistoryItem = ({
  data: {
    chainId,
    timestamp,
    sendingTx,
    receivingTx,
    amount,
    decimals,
    symbol,
    message,
  },
}) => {
  const { providerChainId, ethersProvider } = useContext(Web3Context);
  const bridgeChainId = getBridgeNetwork(chainId);

  const timestampString = useBreakpointValue({
    base: new Date(parseInt(timestamp, 10) * 1000).toLocaleTimeString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    // lg: new Date(parseInt(timestamp, 10) * 1000).toLocaleTimeString([], {
    //   weekday: 'long',
    //   year: 'numeric',
    //   month: 'long',
    //   day: 'numeric',
    //   hour: '2-digit',
    //   minute: '2-digit',
    // }),
  });

  const claimTokens = () => {
    if (!isxDaiChain(providerChainId)) {
      executeSignatures(ethersProvider, providerChainId, message);
    }
  };

  // const [tokenDetails, setTokenDetails] = useState();

  // useEffect(() => {
  //   fetchTokenDetails(chainId, token).then(details => setTokenDetails(details));
  // }, [chainId, token, setTokenDetails]);

  return (
    <Flex
      w="100%"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      p={{ base: 4, sm: 8 }}
      mb={4}
    >
      <Grid
        // templateColumns={{ base: '2fr 2fr', md: '2fr 3fr' }}
        templateColumns="1fr 1.25fr 1fr 1fr 1.25fr 0.5fr"
        w="100%"
      >
        <Text>{timestampString}</Text>
        <Flex align="center">
          {getNetworkTag(chainId)}
          <Image src={RightArrowImage} mx="0.5rem" />
          {getNetworkTag(bridgeChainId)}
        </Flex>
        <Link
          color="blue.500"
          href={getMonitorUrl(chainId, sendingTx)}
          rel="noreferrer noopener"
          target="_blank"
        >
          {shortenHash(sendingTx)}
        </Link>
        {receivingTx ? (
          <Link
            color="blue.500"
            href={`${getExplorerUrl(bridgeChainId)}/tx/${receivingTx}`}
            rel="noreferrer noopener"
            target="_blank"
          >
            {shortenHash(receivingTx)}
          </Link>
        ) : (
          <Text />
        )}
        <Text>
          {formatUnits(BigNumber.from(amount), decimals)} {symbol}
        </Text>
        {receivingTx ? (
          <Flex align="center">
            <Image src={BlueTickImage} mr="0.5rem" />
            <Text color="blue.500">Claimed</Text>
          </Flex>
        ) : (
          <Flex align="center">
            <Button size="sm" colorScheme="blue" onClick={claimTokens}>
              Claim
            </Button>
          </Flex>
        )}
      </Grid>
    </Flex>
  );
};
