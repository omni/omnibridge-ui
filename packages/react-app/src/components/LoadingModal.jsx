import {
  Flex,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/core';
import React, { useContext } from 'react';

import LoadingImage from '../assets/loading.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { getMonitorUrl } from '../lib/helpers';
import { ProgressRing } from './ProgressRing';

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

export const LoadingModal = () => {
  const { loading, fromToken, transaction, totalConfirms } = useContext(
    BridgeContext,
  );

  return (
    <Modal
      isOpen={loading}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay background="modalBG">
        {(!transaction || totalConfirms === 0) && (
          <Flex direction="column" align="center">
            <Image src={LoadingImage} mb={4} />
            <Text color="white" fontWeight="bold">
              Loading ...
            </Text>
          </Flex>
        )}
        {transaction && totalConfirms && (
          <ModalContent boxShadow="0px 1rem 2rem #617492" borderRadius="full">
            <ModalBody p={4}>
              <Flex align="center">
                <Flex
                  height="5rem"
                  width="5rem"
                  align="center"
                  justify="center"
                  border="5px solid #eef4fd"
                  borderRadius="50%"
                  mr={4}
                  position="relative"
                >
                  <Text>{`${
                    transaction.confirmations < totalConfirms
                      ? transaction.confirmations
                      : totalConfirms
                  }/${totalConfirms}`}</Text>
                  <Flex
                    position="absolute"
                    justify="center"
                    align="center"
                    color="blue.500"
                  >
                    <ProgressRing
                      radius={47.5}
                      stroke={5}
                      progress={
                        transaction.confirmations < totalConfirms
                          ? transaction.confirmations
                          : totalConfirms
                      }
                      totalProgress={totalConfirms}
                    />
                  </Flex>
                </Flex>
                <Flex height="100%" flex={1} direction="column">
                  <Text width="100%">Waiting for Block Confirmations...</Text>
                  <Text width="100%" color="grey">
                    {'Monitor at ALM '}
                    <Link
                      href={getMonitorUrl(fromToken.chainId, transaction.hash)}
                      rel="noreferrer noopener"
                      target="_blank"
                      color="blue.500"
                    >
                      {getTransactionString(transaction.hash)}
                    </Link>
                  </Text>
                </Flex>
              </Flex>
            </ModalBody>
          </ModalContent>
        )}
      </ModalOverlay>
    </Modal>
  );
};
