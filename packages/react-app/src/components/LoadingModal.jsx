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
import {
  getCollectedSignatures,
  getMessageCallStatus,
  getMessageFromReceipt,
} from '../lib/amb';
import { getMonitorUrl, isxDaiChain } from '../lib/helpers';
import { ClaimTokensModal } from './ClaimTokensModal';
import { ProgressRing } from './ProgressRing';

const POLLING_INTERVAL = 1000;

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

export const LoadingModal = ({ loadingProps }) => {
  const [receipt, setReceipt] = useState();
  const { ethersProvider, account } = useContext(Web3Context);
  const {
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

    console.log({ txHash, ethersProvider });
    if (!txHash || !ethersProvider) return unsubscribe;

    const { chainId } = fromToken;
    let message = null;
    let collectedSignatures = false;
    let status = false;

    const getReceipt = async () => {
      try {
        const txReceipt = await ethersProvider.getTransactionReceipt(txHash);
        setReceipt(txReceipt);

        if (txReceipt && txReceipt.confirmations >= totalConfirms) {
          setLoadingText('Collecting Signatures');
        }

        if (txReceipt && !message) {
          message = getMessageFromReceipt(chainId, txReceipt);
        }

        if (message && collectedSignatures) {
          setLoadingText('Waiting for Execution');
          if (isxDaiChain(chainId)) {
            setNeedsConfirmation(true);
            unsubscribe();
            return;
          }
          status = await getMessageCallStatus(chainId, message);
        } else if (message) {
          collectedSignatures = await getCollectedSignatures(message);
        }

        if (status) {
          setReceipt();
          setLoading(false);
          setLoadingText();
        }

        if (
          !txReceipt ||
          !message ||
          !status ||
          !collectedSignatures ||
          !needsConfirmation
        ) {
          const timeoutId = setTimeout(() => getReceipt(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (error) {
        setReceipt();
        setLoading(false);
        setLoadingText();
        // eslint-disable-next-line
        console.log({ receiptError: error });
      }
    };

    // unsubscribe from previous polls
    unsubscribe();

    getReceipt();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [txHash, totalConfirms, ethersProvider, setToken, fromToken, account, setLoading, needsConfirmation]);

  return needsConfirmation ? (
    <ClaimTokensModal setNeedsConfirmation={setNeedsConfirmation} />
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
