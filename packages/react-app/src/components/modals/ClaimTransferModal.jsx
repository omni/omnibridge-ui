import {
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
} from '@chakra-ui/react';
import ClaimTokenImage from 'assets/claim.svg';
import ErrorImage from 'assets/error.svg';
import InfoImage from 'assets/info.svg';
import { LoadingModal } from 'components/modals/LoadingModal';
import { BridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import {
  executeSignatures,
  getMessageFromTxHash,
  getMessageStatus,
} from 'lib/amb';
import {
  FOREIGN_CHAIN_ID,
  HOME_CHAIN_ID,
  POLLING_INTERVAL,
} from 'lib/constants';
import { getNetworkName, logError } from 'lib/helpers';
import React, { useContext, useEffect, useState } from 'react';

export const ClaimTransferModal = () => {
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
    if (message && message.user.toLowerCase() !== account.toLowerCase()) {
      setTxHash();
    }
  }, [message, account, setTxHash]);

  const claimable =
    !claiming &&
    message &&
    message.msgData &&
    message.signatures &&
    !executed &&
    providerChainId === FOREIGN_CHAIN_ID;

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
        await executeSignatures(ethersProvider, FOREIGN_CHAIN_ID, message);
        setLoadingText('Waiting for Execution');
      } catch (executeError) {
        setClaiming(false);
        setLoadingText('');
        logError({ executeError, chainId: FOREIGN_CHAIN_ID, message });
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
          const msg = await getMessageFromTxHash(HOME_CHAIN_ID, txHash);
          setMessage(msg);
          return;
        }

        status = await getMessageStatus(FOREIGN_CHAIN_ID, message.msgId);
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
  }, [message, claiming, txHash, setTxHash]);

  if (!message || claiming)
    return (
      <LoadingModal
        loadingText={message ? loadingText : ''}
        chainId={HOME_CHAIN_ID}
        txHash={txHash}
      />
    );
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
            <Flex align="center" direction="column">
              <Flex
                mt={4}
                w="100%"
                borderRadius="4px"
                border="1px solid #DAE3F0"
                mb={executed ? 6 : 0}
              >
                <Flex
                  bg="rgba(83, 164, 255, 0.1)"
                  borderLeftRadius="4px"
                  border="1px solid #53A4FF"
                  justify="center"
                  align="center"
                  minW="4rem"
                  maxW="4rem"
                  flex={1}
                >
                  <Image src={InfoImage} />
                </Flex>
                <Flex align="center" fontSize="12px" p={4}>
                  <Text>
                    {`The claim process may take a variable period of time on ${getNetworkName(
                      FOREIGN_CHAIN_ID,
                    )}${' '}
                    depending on network congestion. Your ${
                      message.symbol
                    } balance will increase to reflect${' '}
                    the completed transfer after the claim is processed`}
                  </Text>
                </Flex>
              </Flex>
              {executed && (
                <Flex w="100%" borderRadius="4px" border="1px solid #DAE3F0">
                  <Flex
                    bg="rgba(255, 102, 92, 0.1)"
                    borderLeftRadius="4px"
                    border="1px solid #FF665C"
                    justify="center"
                    align="center"
                    minW="4rem"
                    maxW="4rem"
                    flex={1}
                  >
                    <Image src={ErrorImage} />
                  </Flex>
                  <Flex align="center" fontSize="12px" p={4}>
                    <Text>The transfer request was already executed</Text>
                  </Flex>
                </Flex>
              )}
            </Flex>
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
