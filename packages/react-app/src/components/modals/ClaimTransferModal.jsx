import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import ClaimTokenImage from 'assets/claim.svg';
import { LoadingModal } from 'components/modals/LoadingModal';
import { AuspiciousGasWarning } from 'components/warnings/AuspiciousGasWarning';
import { BridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import {
  executeSignatures,
  getMessageFromTxHash,
  getMessageStatus,
} from 'lib/amb';
import { POLLING_INTERVAL } from 'lib/constants';
import {
  getGasPrice,
  getLowestHistoricalEthGasPrice,
  getMedianHistoricalEthGasPrice,
} from 'lib/gasPrice';
import {
  getHelperContract,
  getNativeCurrency,
  getNetworkName,
  logError,
} from 'lib/helpers';
import React, { useContext, useEffect, useState } from 'react';

export const ClaimTransferModal = () => {
  const {
    homeChainId,
    foreignChainId,
    foreignAmbAddress,
    getGraphEndpoint,
    enableForeignCurrencyBridge,
  } = useBridgeDirection();
  const { account, ethersProvider, providerChainId } = useWeb3Context();
  const { txHash, setTxHash } = useContext(BridgeContext);
  const [isOpen, setOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(!!message);
    if (
      message &&
      message.user &&
      message.user.toLowerCase() !== account.toLowerCase()
    ) {
      setTxHash();
    }
  }, [message, account, setTxHash]);

  const claimable =
    !claiming &&
    message &&
    message.msgData &&
    message.signatures &&
    !executed &&
    providerChainId === foreignChainId;

  const toast = useToast();
  const showError = errorMsg => {
    if (errorMsg) {
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        isClosable: 'true',
      });
    }
  };

  const onClick = async () => {
    if (executed) {
      showError('Message already executed');
    } else if (!message || !message.msgData || !message.signatures) {
      showError('Still Collecting Signatures...');
    } else if (claimable) {
      try {
        setClaiming(true);
        const { error, alreadyClaimed, data } = await executeSignatures(
          ethersProvider,
          foreignAmbAddress,
          message,
        );
        setLoadingText('Waiting for Execution');
        if (error) {
          throw error;
        }

        if (!data && alreadyClaimed) {
          showError(
            `The transfer was already executed. Check your balance of this token in ${getNetworkName(
              foreignChainId,
            )}</strong>`,
          );
        }
      } catch (executeError) {
        setClaiming(false);
        setLoadingText('');
        logError({ executeError, chainId: foreignChainId, message });
        if (executeError && executeError.message) {
          showError(executeError.message);
        } else {
          showError(
            'Impossible to perform the operation. Reload the application and try again.',
          );
        }
      }
    }
  };

  useEffect(() => {
    const subscriptions = [];
    const unsubscribe = () => {
      subscriptions.forEach(s => {
        clearTimeout(s);
      });
    };

    let status = false;

    const getStatus = async () => {
      try {
        if (!message || !message.signatures) {
          unsubscribe();
          const msg = await getMessageFromTxHash(
            getGraphEndpoint(homeChainId),
            txHash,
          );
          setMessage(msg);
          return;
        }

        status = await getMessageStatus(
          getGraphEndpoint(foreignChainId),
          message.msgId,
        );
        if (status) {
          unsubscribe();
          if (claiming) {
            onClose();
            setClaiming(false);
          }
          setLoadingText('');
          setTxHash();
          setExecuted(true);
          return;
        }

        if (!status) {
          const timeoutId = setTimeout(() => getStatus(), POLLING_INTERVAL);
          subscriptions.push(timeoutId);
        }
      } catch (statusError) {
        setClaiming(false);
        setLoadingText('');
        setTxHash();
        logError({ statusError });
      }
    };
    // unsubscribe from previous polls
    unsubscribe();

    getStatus();
    // unsubscribe when unmount component
    return unsubscribe;
  }, [
    message,
    claiming,
    txHash,
    setTxHash,
    foreignChainId,
    homeChainId,
    getGraphEndpoint,
  ]);

  if (!message || claiming)
    return (
      <LoadingModal
        loadingText={message ? loadingText : ''}
        chainId={homeChainId}
        txHash={txHash}
      />
    );

  const foreignCurrencyHelperContract = getHelperContract(foreignChainId);
  const { symbol: tokenSymbol } =
    enableForeignCurrencyBridge &&
    message.recipient === foreignCurrencyHelperContract
      ? getNativeCurrency(foreignChainId)
      : message;
  const currentGasPrice = getGasPrice();
  const medianGasPrice = getMedianHistoricalEthGasPrice();
  const lowestGasPrice = getLowestHistoricalEthGasPrice();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="33.75rem"
          mx={{ base: 12, lg: 0 }}
        >
          <ModalHeader p={6}>
            <Text>Claim Your Tokens</Text>
            <Image src={ClaimTokenImage} w="100%" mt={4} />
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody px={6} py={0}>
            <VStack align="center" direction="column" spacing="4">
              {foreignChainId === 1 && medianGasPrice.gt(currentGasPrice) && (
                <AuspiciousGasWarning
                  currentPrice={currentGasPrice}
                  medianPrice={medianGasPrice}
                  lowestPrice={lowestGasPrice}
                  noShadow
                  noMargin
                />
              )}
              <Flex align="center" direction="column" w="100%">
                <Alert status="info" borderRadius={5}>
                  <AlertIcon minWidth="20px" />
                  <Text fontSize="small">
                    {`The claim process may take a variable period of time on ${getNetworkName(
                      foreignChainId,
                    )}${' '}
                    depending on network congestion. Your ${tokenSymbol} balance will increase to reflect${' '}
                    the completed transfer after the claim is processed`}
                  </Text>
                </Alert>
              </Flex>
              {executed && (
                <Flex align="center" direction="column" w="100%">
                  <Alert status="error" borderRadius={5}>
                    <AlertIcon minWidth="20px" />
                    <Text fontSize="small">
                      The transfer request was already executed
                    </Text>
                  </Alert>
                </Flex>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter p={6}>
            <Flex
              w="100%"
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
            >
              <Button
                px={12}
                onClick={onClose}
                background="background"
                _hover={{ background: '#bfd3f2' }}
                color="#687D9D"
              >
                Cancel
              </Button>
              <Button
                px={12}
                onClick={onClick}
                colorScheme="blue"
                mt={{ base: 2, md: 0 }}
                isLoading={claiming}
              >
                Claim
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
