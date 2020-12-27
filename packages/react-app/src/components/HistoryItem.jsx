import {
  Button,
  Flex,
  Grid,
  Image,
  Link,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { BigNumber, utils } from 'ethers';
import React, { useContext, useEffect, useState } from 'react';

import BlueTickImage from '../assets/blue-tick.svg';
import RightArrowImage from '../assets/right-arrow.svg';
import { Web3Context } from '../contexts/Web3Context';
import {
  executeSignatures,
  getMessageFromTxHash,
  getMessageStatus,
} from '../lib/amb';
import { HOME_NETWORK , POLLING_INTERVAL } from '../lib/constants';
import {
  getBridgeNetwork,
  getExplorerUrl,
  getMonitorUrl,
  getNetworkName,
  isxDaiChain,
  logError,
} from '../lib/helpers';
import { ErrorModal } from './ErrorModal';

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
    height="1.5rem"
    fontSize="xs"
    color="white"
    fontWeight="600"
    w="auto"
  >
    <Text>{txt}</Text>
  </Flex>
);

const networkTags = {
  100: <Tag bg="#4DA9A6" txt="xDai" />,
  1: <Tag bg="#5A74DA" txt="Ethereum" />,
  42: <Tag bg="#5A74DA" txt="Kovan" />,
  77: <Tag bg="#4DA9A6" txt="POA Sokol" />,
};

const getNetworkTag = chainId => networkTags[chainId];

export const HistoryItem = ({
  data: {
    chainId,
    timestamp,
    sendingTx,
    receivingTx: inputReceivingTx,
    amount,
    decimals,
    symbol,
    message: inputMessage,
  },
}) => {
  const { providerChainId, ethersProvider } = useContext(Web3Context);
  const bridgeChainId = getBridgeNetwork(chainId);
  const [receivingTx, setReceiving] = useState(inputReceivingTx);
  const [message, setMessage] = useState(inputMessage);

  const timestampString = new Date(
    parseInt(timestamp, 10) * 1000,
  ).toLocaleTimeString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const { onOpen, isOpen, onClose } = useDisclosure();
  const claimable = message && message.msgData && message.signatures;
  const isxDai = isxDaiChain(providerChainId);
  const [loading, setLoading] = useState(false);
  const claimTokens = async () => {
    if (loading || !claimable) return;
    if (isxDai) {
      onOpen();
    } else {
      setLoading(true);
      try {
        const tx = await executeSignatures(
          ethersProvider,
          providerChainId,
          message,
        ).catch(contractError => logError({ contractError }));
        setReceiving(tx.hash);
      } catch (executeError) {
        logError({ executeError });
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    if (receivingTx || inputReceivingTx || !message || !message.msgId)
      return unsubscribe;
    let execution = null;
    let request = null;
    const { msgId } = message;

    const getStatus = async () => {
      try {
        [execution, request] = await Promise.all([
          !receivingTx ? getMessageStatus(bridgeChainId, msgId) : null,
          !message.signatures ? getMessageFromTxHash(chainId, sendingTx) : null,
        ]);
        if (execution) {
          setReceiving(execution.txHash);
        }
        if (request) {
          setMessage(request);
        }

        if (!(receivingTx && message)) {
          const timeoutId = setTimeout(() => getStatus(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (messageError) {
        logError({ messageError });
      }
    };
    // unsubscribe from previous polls
    unsubscribe();

    getStatus();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [
    chainId,
    receivingTx,
    inputReceivingTx,
    bridgeChainId,
    providerChainId,
    message,
    sendingTx,
  ]);

  return (
    <Flex
      w="100%"
      background="white"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      borderRadius="1rem"
      fontSize="sm"
      p={4}
      mb={4}
    >
      {isxDai && (
        <ErrorModal
          message={`Please switch wallet to ${getNetworkName(
            getBridgeNetwork(HOME_NETWORK),
          )}`}
          isOpen={isOpen}
          onClose={onClose}
        />
      )}
      <Grid
        templateColumns={{
          base: '1fr',
          md: '0.5fr 1.75fr 1fr 1fr 1.25fr 0.5fr',
          lg: '1fr 1.25fr 1fr 1fr 1.25fr 0.5fr',
        }}
        w="100%"
      >
        <Flex align="center" justify="space-between" mb={{ base: 1, md: 0 }}>
          <Text display={{ base: 'inline-block', md: 'none' }} color="greyText">
            Date
          </Text>
          <Text my="auto">{timestampString}</Text>
        </Flex>
        <Flex align="center" justify="space-between" mb={{ base: 1, md: 0 }}>
          <Text display={{ base: 'inline-block', md: 'none' }} color="greyText">
            Direction
          </Text>
          <Flex align="center">
            {getNetworkTag(chainId)}
            <Image src={RightArrowImage} mx="0.5rem" />
            {getNetworkTag(bridgeChainId)}
          </Flex>
        </Flex>
        <Flex
          align="center"
          justify={{ base: 'space-between', md: 'center' }}
          mb={{ base: 1, md: 0 }}
        >
          <Text display={{ base: 'inline-block', md: 'none' }} color="greyText">
            Sending Tx
          </Text>
          <Link
            color="blue.500"
            href={getMonitorUrl(chainId, sendingTx)}
            rel="noreferrer noopener"
            target="_blank"
            my="auto"
            textAlign="center"
          >
            {shortenHash(sendingTx)}
          </Link>
        </Flex>
        <Flex
          align="center"
          justify={{ base: 'space-between', md: 'center' }}
          mb={{ base: 1, md: 0 }}
        >
          <Text display={{ base: 'inline-block', md: 'none' }} color="greyText">
            Receiving Tx
          </Text>
          {receivingTx ? (
            <Link
              color="blue.500"
              href={`${getExplorerUrl(bridgeChainId)}/tx/${receivingTx}`}
              rel="noreferrer noopener"
              target="_blank"
              my="auto"
              textAlign="center"
            >
              {shortenHash(receivingTx)}
            </Link>
          ) : (
            <Text />
          )}
        </Flex>
        <Flex
          align="center"
          justify={{ base: 'space-between', md: 'center' }}
          mb={{ base: 1, md: 0 }}
        >
          <Text display={{ base: 'inline-block', md: 'none' }} color="greyText">
            Amount
          </Text>
          <Text my="auto" textAlign="center">
            {formatUnits(BigNumber.from(amount), decimals)} {symbol}
          </Text>
        </Flex>
        {receivingTx ? (
          <Flex align="center" justify={{ base: 'center', md: 'flex-end' }}>
            <Image src={BlueTickImage} mr="0.5rem" />
            <Text color="blue.500">Claimed</Text>
          </Flex>
        ) : (
          <Flex align="center" justify={{ base: 'center', md: 'flex-end' }}>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={claimTokens}
              isDisabled={!claimable}
              isLoading={loading}
            >
              Claim
            </Button>
          </Flex>
        )}
      </Grid>
    </Flex>
  );
};
