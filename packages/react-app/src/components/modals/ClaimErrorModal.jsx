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
} from '@chakra-ui/react';
import BlueTickImage from 'assets/blue-tick.svg';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { getNetworkName } from 'lib/helpers';
import React from 'react';

const ClaimErrorModal = ({ onClose, claimErrorShow, claimErrorToken }) => {
  const { foreignChainId } = useBridgeDirection();
  return (
    <Modal isOpen={claimErrorShow} onClose={onClose} isCentered>
      <ModalOverlay background="modalBG">
        <ModalContent
          boxShadow="0px 1rem 2rem #617492"
          borderRadius="1rem"
          maxW="33.75rem"
          mx={{ base: 12, lg: 0 }}
        >
          <ModalHeader p={6} display="flex" alignItems="center">
            <Text>Transfer done already</Text>
            <Image src={BlueTickImage} ml={2} width="20px" height="20px" />
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
              <Box w="100%">
                <Text as="span">
                  The tokens were already claimed. Check your
                  {claimErrorToken ? ` ${claimErrorToken.symbol} ` : ' '}
                  token balance in{' '}
                  <strong>{getNetworkName(foreignChainId)}</strong>.
                </Text>
              </Box>
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
                colorScheme="blue"
                mt={{ base: 2, md: 0 }}
                w="100%"
                onClick={onClose}
              >
                Understood
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export { ClaimErrorModal };
