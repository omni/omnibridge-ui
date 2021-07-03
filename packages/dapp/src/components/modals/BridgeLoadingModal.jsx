import { CheckIcon } from '@chakra-ui/icons';
import {
  Flex,
  Image,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
  Text,
} from '@chakra-ui/react';
import LoadingImage from 'assets/loading.svg';
import { ProgressRing } from 'components/common/ProgressRing';
import { ClaimTokensModal } from 'components/modals/ClaimTokensModal';
import { ClaimTransferModal } from 'components/modals/ClaimTransferModal';
import { NeedsConfirmationModal } from 'components/modals/NeedsConfirmationModal';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useTransactionStatus } from 'hooks/useTransactionStatus';
import React, { useEffect, useState } from 'react';

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

const BridgeLoader = ({
  loading,
  loadingText,
  txHash,
  confirmations,
  totalConfirms,
  getMonitorUrl,
  chainId,
}) => {
  const showConfirmations = confirmations < totalConfirms;
  const displayConfirms = showConfirmations ? confirmations : totalConfirms;

  return (
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
              <ModalBody px={4} py={8}>
                <Flex
                  align={{ base: 'center', md: 'stretch' }}
                  direction={{ base: 'column', md: 'row' }}
                >
                  <Flex
                    h="3.25rem"
                    w="3.25rem"
                    align="center"
                    justify="center"
                    border="5px solid #eef4fd"
                    borderRadius="50%"
                    ml={2}
                    mr={4}
                    mb={{ base: 2, md: 0 }}
                    position="relative"
                  >
                    {showConfirmations ? (
                      <>
                        <Text fontSize="sm">
                          {displayConfirms}/{totalConfirms}
                        </Text>
                        <Flex
                          position="absolute"
                          justify="center"
                          align="center"
                          color="blue.500"
                        >
                          <ProgressRing
                            radius={33.5}
                            stroke={5}
                            progress={displayConfirms}
                            totalProgress={totalConfirms}
                          />
                        </Flex>
                      </>
                    ) : (
                      <>
                        <CheckIcon color="blue.500" boxSize="0.85rem" />
                        <Spinner
                          position="absolute"
                          color="blue.500"
                          thickness="5px"
                          w="3.25rem"
                          h="3.25rem"
                          speed="0.75s"
                        />
                      </>
                    )}
                  </Flex>
                  <Flex
                    flex={1}
                    direction="column"
                    align={{ base: 'center', md: 'flex-start' }}
                    justify="center"
                    mt={{ base: 2, md: 0 }}
                  >
                    <Text textAlign="center">
                      {`${loadingText || 'Waiting for Block Confirmations'}...`}
                    </Text>
                    <Text color="grey" textAlign="center">
                      {'Monitor at ALM '}
                      <Link
                        href={getMonitorUrl(chainId, txHash)}
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

export const BridgeLoadingModal = () => {
  const { providerChainId: chainId } = useWeb3Context();
  const { getMonitorUrl, homeChainId, foreignChainId } = useBridgeDirection();
  const { loading, txHash, totalConfirms } = useBridgeContext();
  const [message, setMessage] = useState();
  const {
    loadingText,
    needsConfirmation,
    setNeedsConfirmation,
    confirmations,
  } = useTransactionStatus(setMessage);

  useEffect(() => {
    if (chainId === homeChainId) {
      setMessage();
    }
  }, [chainId, homeChainId]);

  const { neverShowClaims, needsSaving } = useSettings();
  const txNeedsClaiming =
    !!message && !!txHash && !loading && chainId === foreignChainId;

  const claimTransfer = txNeedsClaiming ? (
    <ClaimTransferModal message={message} setMessage={setMessage} />
  ) : null;

  const claimAllTokens =
    txNeedsClaiming || neverShowClaims || needsSaving ? null : (
      <ClaimTokensModal />
    );

  const loader = needsConfirmation ? (
    <NeedsConfirmationModal
      setNeedsConfirmation={setNeedsConfirmation}
      setMessage={setMessage}
    />
  ) : (
    <BridgeLoader
      loadingText={loadingText}
      loading={loading}
      confirmations={confirmations}
      totalConfirms={totalConfirms}
      chainId={chainId}
      getMonitorUrl={getMonitorUrl}
      txHash={txHash}
    />
  );

  return (
    <>
      {claimAllTokens}
      {claimTransfer}
      {loader}
    </>
  );
};
