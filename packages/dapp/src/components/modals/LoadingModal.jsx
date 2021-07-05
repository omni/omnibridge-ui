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
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import React from 'react';

const getTransactionString = hash => {
  if (!hash) return 'here';
  const len = hash.length;
  return `${hash.substr(0, 6)}...${hash.substr(len - 4, len - 1)}`;
};

export const LoadingModal = ({ loadingText, txHash, chainId }) => {
  const { getMonitorUrl } = useBridgeDirection();
  const { providerChainId } = useWeb3Context();
  const { loading } = useBridgeContext();
  return (
    <Modal
      isOpen={!loading}
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
                    <Spinner
                      position="absolute"
                      color="blue.500"
                      thickness="5px"
                      h="3.25rem"
                      w="3.25rem"
                      speed="0.75s"
                    />
                  </Flex>
                  <Flex
                    flex={1}
                    direction="column"
                    align={{ base: 'center', md: 'flex-start' }}
                    justify="center"
                    mt={{ base: 2, md: 0 }}
                  >
                    <Text textAlign="center">{`${loadingText}...`}</Text>
                    <Text textAlign="center" color="grey">
                      {'Monitor at ALM '}
                      <Link
                        href={getMonitorUrl(chainId || providerChainId, txHash)}
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
