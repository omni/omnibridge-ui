import {
  Flex,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';

import LoadingImage from '../assets/loading.svg';
import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { getMessageFromTxHash, getMessageStatus } from '../lib/amb';
import { POLLING_INTERVAL } from '../lib/constants';
import { getBridgeNetwork, getMonitorUrl, isxDaiChain } from '../lib/helpers';
import { NeedsConfirmationModal } from './NeedsConfirmationModal';
import { ProgressRing } from './ProgressRing';

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

export const LoadingModal = ({ loadingProps }) => {
  const { ethersProvider, account, providerChainId } = useContext(Web3Context);
  const {
    receipt,
    setReceipt,
    loading,
    setLoading,
    fromToken,
    txHash,
    totalConfirms,
    setToken,
  } = useContext(BridgeContext);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [loadingText, setLoadingText] = useState();
  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    if (!txHash || !ethersProvider || !loading) return unsubscribe;

    const chainId = providerChainId;
    let message = null;
    let status = false;
    const isxDai = isxDaiChain(chainId);

    const getReceipt = async () => {
      try {
        const txReceipt = await ethersProvider.getTransactionReceipt(txHash);
        if (txReceipt) {
          setReceipt(txReceipt);
        }

        if (isxDai) {
          setLoadingText('Collecting Signatures');
        } else {
          setLoadingText('Waiting for Execution');
        }

        if (txReceipt && (!message || (isxDai && !message.signatures))) {
          message = await getMessageFromTxHash(chainId, txHash);
        }

        if (isxDai) {
          if (message && message.signatures) {
            setNeedsConfirmation(true);
            unsubscribe();
            setReceipt();
            setLoading(false);
            setLoadingText();
            return;
          }
        } else if (message) {
          status = await getMessageStatus(
            getBridgeNetwork(chainId),
            message.msgId,
          );
          if (status) {
            unsubscribe();
            setReceipt();
            setLoading(false);
            setLoadingText();
            return;
          }
        }

        if (
          !txReceipt ||
          !message ||
          (isxDai ? !message.signatures : !status)
        ) {
          const timeoutId = setTimeout(() => getReceipt(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (error) {
        setReceipt();
        setLoading(false);
        setLoadingText();
        // eslint-disable-next-line no-console
        console.log({ receiptError: error });
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    getReceipt();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [
    loading,
    providerChainId,
    txHash,
    totalConfirms,
    ethersProvider,
    setToken,
    fromToken,
    account,
    setLoading,
    setReceipt,
  ]);

  useEffect(() => {
    setNeedsConfirmation(needs => isxDaiChain(providerChainId) && needs);
  }, [providerChainId]);

  return needsConfirmation ? (
    <NeedsConfirmationModal />
  ) : (
    <Modal
      isOpen={loading || loadingProps}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay background="modalBG">
        <>
          {(!receipt || totalConfirms === 0) && (
            <ModalContent background="none" boxShadow="none" borderRadius="0">
              <Flex direction="column" align="center" justify="center">
                <Image src={LoadingImage} mb={4} />
                <Text color="white" fontWeight="bold">
                  Loading ...
                </Text>
              </Flex>
            </ModalContent>
          )}
          {receipt && totalConfirms > 0 && (
            <ModalContent
              boxShadow="0px 1rem 2rem #617492"
              borderRadius="full"
              mx={{ base: 12, lg: 0 }}
              maxW={{ base: '20rem', md: '25rem' }}
            >
              <ModalBody p={4}>
                <Flex
                  align={{ base: 'center', md: 'stretch' }}
                  direction={{ base: 'column', md: 'row' }}
                >
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
                      receipt.confirmations < totalConfirms
                        ? receipt.confirmations
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
                          receipt.confirmations < totalConfirms
                            ? receipt.confirmations
                            : totalConfirms
                        }
                        totalProgress={totalConfirms}
                      />
                    </Flex>
                  </Flex>
                  <Flex
                    flex={1}
                    direction="column"
                    align={{ base: 'stretch', md: 'center' }}
                    justify="center"
                  >
                    <Text width="100%">
                      {`${loadingText || 'Waiting for Block Confirmations'}...`}
                    </Text>
                    <Text width="100%" color="grey">
                      {'Monitor at ALM '}
                      <Link
                        href={getMonitorUrl(fromToken.chainId, txHash)}
                        rel="noreferrer noopener"
                        target="_blank"
                        color="blue.500"
                      >
                        {getTransactionString(txHash)}
                      </Link>
                    </Text>
                  </Flex>
                </Flex>
              </ModalBody>
            </ModalContent>
          )}
        </>
      </ModalOverlay>
    </Modal>
  );
};
