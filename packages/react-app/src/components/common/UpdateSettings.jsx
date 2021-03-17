import {
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import SettingsImage from 'assets/settings.svg';
import { useSettings } from 'contexts/SettingsContext';
import { SettingsIcon } from 'icons/SettingsIcon';
import { FOREIGN_CHAIN_ID, HOME_CHAIN_ID } from 'lib/constants';
import { getNetworkLabel } from 'lib/helpers';
import React, { useCallback, useRef } from 'react';

export const UpdateSettings = ({ close }) => {
  const initialRef = useRef();
  const {
    mainnetRPC,
    setMainnetRPC,
    xdaiRPC,
    setXDaiRPC,
    infiniteUnlock,
    setInfiniteUnlock,
    neverShowClaims,
    setNeverShowClaims,
    tokenListWithBalance,
    setTokenListWithBalance,
    update,
    save,
    needsSaving,
  } = useSettings();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const onSave = useCallback(() => {
    save();
    onClose();
  }, [save, onClose]);

  const openSettings = useCallback(() => {
    close();
    update();
    onOpen();
  }, [close, update, onOpen]);

  return (
    <>
      <Flex
        cursor="pointer"
        align="center"
        fontWeight="bold"
        color="grey"
        transition="0.25s"
        _hover={{ color: 'blue.500' }}
        onClick={openSettings}
      >
        <SettingsIcon mr={2} />
        <Text color="black"> Settings</Text>
      </Flex>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        isCentered
        initialFocusRef={initialRef}
      >
        <ModalOverlay background="modalBG">
          <ModalContent
            boxShadow="0px 1rem 2rem #617492"
            borderRadius="1rem"
            maxW="30rem"
            mx={{ base: 12, lg: 0 }}
          >
            <ModalHeader p={6}>
              <Text>Settings</Text>
              <Image src={SettingsImage} w="100%" mt={4} />
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
                <Text mb={2}>Infinite Unlock</Text>
                <Switch
                  mb={4}
                  colorScheme="blue"
                  isChecked={infiniteUnlock}
                  onChange={e => setInfiniteUnlock(e.target.checked)}
                />
                <Text mb={2}>
                  Custom {getNetworkLabel(FOREIGN_CHAIN_ID)} RPC URL
                </Text>
                <InputGroup mb={4} borderColor="#DAE3F0">
                  <Input
                    id="symbol"
                    size="sm"
                    onChange={e => setMainnetRPC(e.target.value)}
                    _placeholder={{ color: 'grey' }}
                    value={mainnetRPC}
                  />
                </InputGroup>
                <Text mb={2}>
                  Custom {getNetworkLabel(HOME_CHAIN_ID)} RPC URL
                </Text>
                <InputGroup mb={4} borderColor="#DAE3F0">
                  <Input
                    id="decimals"
                    size="sm"
                    onChange={e => setXDaiRPC(e.target.value)}
                    _placeholder={{ color: 'grey' }}
                    value={xdaiRPC}
                  />
                </InputGroup>
                <Text mb={2}>Turn Off Claim Notifications</Text>
                <Switch
                  mb={4}
                  colorScheme="blue"
                  isChecked={neverShowClaims}
                  onChange={e => setNeverShowClaims(e.target.checked)}
                />
                <Text mb={2}>Fetch token list with balance</Text>
                <Switch
                  mb={4}
                  colorScheme="blue"
                  isChecked={tokenListWithBalance}
                  onChange={e => setTokenListWithBalance(e.target.checked)}
                />
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
                  onClick={onSave}
                  colorScheme="blue"
                  mt={{ base: 2, md: 0 }}
                  isDisabled={!needsSaving}
                  ref={initialRef}
                  w="100%"
                >
                  Save
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      </Modal>
    </>
  );
};
