import {
  Box,
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
  VStack,
} from '@chakra-ui/react';
import ClaimTokensImage from 'assets/multiple-claim.svg';
import { LoadingModal } from 'components/modals/LoadingModal';
import { AuspiciousGasWarning } from 'components/warnings/AuspiciousGasWarning';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useClaimableTransfers } from 'hooks/useClaimableTransfers';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import {
  getGasPrice,
  getLowestHistoricalEthGasPrice,
  getMedianHistoricalEthGasPrice,
} from 'lib/gasPrice';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const { DONT_SHOW_CLAIMS } = LOCAL_STORAGE_KEYS;

export const ClaimTokensModal = () => {
  const { foreignChainId } = useBridgeDirection();
  const { account, providerChainId } = useWeb3Context();
  const { transfers, loading } = useClaimableTransfers();
  const [isOpen, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
    window.localStorage.setItem(DONT_SHOW_CLAIMS, 'true');
  };

  useEffect(() => {
    window.localStorage.setItem(DONT_SHOW_CLAIMS, 'false');
  }, [account, providerChainId]);

  useEffect(() => {
    const dontShowClaims =
      window.localStorage.getItem(DONT_SHOW_CLAIMS) === 'true';
    setOpen(!!transfers && transfers.length > 0 && !dontShowClaims);
  }, [transfers]);

  if (loading) return <LoadingModal />;
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
            <Image src={ClaimTokensImage} w="100%" mt={4} />
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
              <Box w="100%">
                <Text as="span">{`You have `}</Text>
                <Text as="b">{transfers ? transfers.length : 0}</Text>
                <Text as="span">{` not claimed transactions `}</Text>
              </Box>
              {foreignChainId === 1 && medianGasPrice.gt(currentGasPrice) && (
                <AuspiciousGasWarning
                  currentPrice={currentGasPrice}
                  medianPrice={medianGasPrice}
                  lowestPrice={lowestGasPrice}
                  noShadow
                  noMargin
                />
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
              <Link
                to="/history"
                display="flex"
                onClick={() => {
                  window.localStorage.setItem('dont-show-claims', 'false');
                }}
              >
                <Button
                  px={12}
                  colorScheme="blue"
                  mt={{ base: 2, md: 0 }}
                  w="100%"
                >
                  Claim
                </Button>
              </Link>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
