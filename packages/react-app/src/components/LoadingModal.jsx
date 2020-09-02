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
import { getMonitorUrl, isxDaiChain } from '../lib/helpers';

export const LoadingModal = () => {
  const { loading, fromToken, transaction } = useContext(BridgeContext);
  const totalConfirms = fromToken && isxDaiChain(fromToken.chainId) ? 2 : 8;

  return (
    <Modal
      isOpen={loading}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay background="modalBG">
        {!transaction && (
          <Flex direction="column" align="center">
            <Image src={LoadingImage} mb={4} />
            <Text color="white" fontWeight="bold">
              Loading ...
            </Text>
          </Flex>
        )}
        {transaction && (
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
                >
                  <Text>
                    ${`${transaction.confirmations}/${totalConfirms}`}
                  </Text>
                </Flex>
                <Flex height="100%" flex={1} direction="column">
                  <Text width="100%">Waiting for Block Confirmations...</Text>
                  <Text width="100%">
                    {'Monitor at ALM '}
                    <Link
                      href={getMonitorUrl(fromToken.chainId, transaction.hash)}
                      rel="noreferrer noopener"
                      target="_blank"
                      color="blue.500"
                    >
                      here
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
