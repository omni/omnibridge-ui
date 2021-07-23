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
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useToast,
} from '@chakra-ui/react';
import MetamaskFox from 'assets/metamask-fox.svg';
import { useWeb3Context } from 'contexts/Web3Context';
import { useCopyToClipboard } from 'hooks/useCopyToClipboard';
import { useRenderChain } from 'hooks/useRenderChain';
import { getAccountString, getNetworkName, logError } from 'lib/helpers';
import { addTokenToMetamask } from 'lib/metamask';
import React, { useCallback, useState } from 'react';

export const AddToMetamaskModal = ({ isOpen, onClose, token: tokenToAdd }) => {
  const [token] = useState(tokenToAdd);
  const { providerChainId } = useWeb3Context();
  const needsNetworkChange = token.chainId !== providerChainId;
  const [loading, setLoading] = useState(false);
  const [copied, handleCopy] = useCopyToClipboard();
  const toast = useToast();

  const showError = useCallback(
    msg => {
      if (msg) {
        toast({
          title: 'Error: Unable to add token',
          description: msg,
          status: 'error',
          isClosable: 'true',
        });
      }
    },
    [toast],
  );

  const onClick = useCallback(async () => {
    setLoading(true);
    try {
      const added = await addTokenToMetamask(token);
      if (added) {
        onClose();
        return;
      }
    } catch (metamaskError) {
      logError({ metamaskError });
      if (metamaskError && metamaskError.message) {
        showError(
          `Please try manually in the wallet app. Got message: "${metamaskError.message}"`,
        );
      }
    }
    setLoading(false);
  }, [showError, onClose, token]);

  const renderChain = useRenderChain();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          mx={{ base: 12, lg: 0 }}
          maxW="30rem"
        >
          <ModalHeader pt={6} px={6}>
            <Flex align="center">
              <Image src={MetamaskFox} mr="1rem" />
              <Text>Add to Metamask</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody px={6} py={0}>
            <Flex direction="column">
              <Text mb="0.5rem">
                {`You are adding the following token on ${getNetworkName(
                  token.chainId,
                )}:`}
              </Text>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>name</Th>
                    <Th>address</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td>{token.name}</Td>
                    <Td>
                      <Tooltip
                        label={copied ? 'Copied!' : 'Copy to clipboard'}
                        closeOnClick={false}
                      >
                        <Button
                          size="xs"
                          fontSize="md"
                          onClick={() =>
                            handleCopy(token.address.toLowerCase())
                          }
                          variant="ghost"
                        >
                          {getAccountString(token.address)}
                        </Button>
                      </Tooltip>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Flex>

            {needsNetworkChange && (
              <Flex align="center" direction="column" w="100%">
                <Flex align="center" direction="column" w="100%" mt="4">
                  <Alert status="info" borderRadius={5}>
                    <AlertIcon minWidth="20px" />
                    <Text fontSize="small">
                      Please switch your wallet to {renderChain(token.chainId)}
                    </Text>
                  </Alert>
                </Flex>
              </Flex>
            )}
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
                isLoading={loading}
                isDisabled={needsNetworkChange}
                colorScheme="blue"
                mt={{ base: 2, md: 0 }}
              >
                Add Token
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
