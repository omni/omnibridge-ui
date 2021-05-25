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
import BlueTickImage from 'assets/blue-tick.svg';
import LoadingImage from 'assets/loading.svg';
import { ProgressRing } from 'components/common/ProgressRing';
import { NeedsConfirmationModal } from 'components/modals/NeedsConfirmationModal';
import { BridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useGraphHealth } from 'hooks/useGraphHealth';
import { useTransactionStatus } from 'hooks/useTransactionStatus';
import React, { useContext } from 'react';

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

export const BridgeLoadingModal = () => {
  const { providerChainId } = useWeb3Context();
  const { getMonitorUrl, homeChainId } = useBridgeDirection();
  const { loading, fromToken, txHash, totalConfirms } = useContext(
    BridgeContext,
  );
  const isHome = providerChainId === homeChainId;
  useGraphHealth(
    'Cannot collect data to finalize the transfer. Wait for a few minutes, reload the application and look for your unclaimed transactions in the History tab',
    { disableAlerts: !txHash || !isHome },
  );
  const {
    loadingText,
    needsConfirmation,
    setNeedsConfirmation,
    confirmations,
  } = useTransactionStatus();

  return needsConfirmation ? (
    <NeedsConfirmationModal setNeedsConfirmation={setNeedsConfirmation} />
  ) : (
    <Modal
      isOpen={loading}
      closeOnEsc={false}
      closeOnOverlayClick={false}
      isCentered
    >
      <ModalOverlay background="modalBG">
        <>
          {loadingText ? (
            <ModalContent
              boxShadow="0px 1rem 2rem #617492"
              borderRadius={{ base: '1rem', md: 'full' }}
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
                    {confirmations < totalConfirms ? (
                      <Text>
                        {confirmations}/{totalConfirms}
                      </Text>
                    ) : (
                      <Image src={BlueTickImage} />
                    )}
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
                          confirmations < totalConfirms
                            ? confirmations
                            : totalConfirms
                        }
                        totalProgress={totalConfirms}
                      />
                    </Flex>
                  </Flex>
                  <Flex
                    flex={1}
                    direction="column"
                    align="center"
                    justify="center"
                    mt={{ base: 2, md: 0 }}
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
          ) : (
            <ModalContent background="none" boxShadow="none" borderRadius="0">
              <Flex direction="column" align="center" justify="center">
                <Image src={LoadingImage} mb={4} />
                <Text color="white" fontWeight="bold">
                  Loading ...
                </Text>
              </Flex>
            </ModalContent>
          )}
        </>
      </ModalOverlay>
    </Modal>
  );
};
