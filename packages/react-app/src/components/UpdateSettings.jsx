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
import React, { useRef, useState } from 'react';

import SettingsImage from '../assets/settings.svg';
import { SettingsIcon } from '../icons/SettingsIcon';

export const UpdateSettings = () => {
  const initialRef = useRef();
  const localMainnetRPC = window.localStorage.getItem('mainnet-rpc-url');
  const [mainnetRPC, setMainnetRPC] = useState(localMainnetRPC || '');
  const localXDaiRPC = window.localStorage.getItem('xdai-rpc-url');
  const [xdaiRPC, setXDaiRPC] = useState(localXDaiRPC || '');
  const localInfiniteUnlock =
    window.localStorage.getItem('infinite-unlock') === 'true';
  const [infiniteUnlock, setInfiniteUnlock] = useState(localInfiniteUnlock);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const isChanged =
    localMainnetRPC !== mainnetRPC ||
    localXDaiRPC !== xdaiRPC ||
    localInfiniteUnlock !== infiniteUnlock;

  const onSave = () => {
    if (!isChanged) return;
    window.localStorage.setItem('mainnet-rpc-url', mainnetRPC);
    window.localStorage.setItem('xdai-rpc-url', xdaiRPC);
    window.localStorage.setItem('infinite-unlock', infiniteUnlock.toString());
    onClose();
  };

  return (
    <>
      <Flex
        cursor="pointer"
        align="center"
        fontWeight="bold"
        color="grey"
        transition="0.25s"
        _hover={{ color: 'blue.500' }}
        onClick={onOpen}
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
                <Text mb={2}>Custom Mainnet RPC URL</Text>
                <InputGroup mb={4} borderColor="#DAE3F0">
                  <Input
                    id="symbol"
                    size="sm"
                    onChange={e => setMainnetRPC(e.target.value)}
                    _placeholder={{ color: 'grey' }}
                    value={mainnetRPC}
                  />
                </InputGroup>
                <Text mb={2}>Custom xDai RPC URL</Text>
                <InputGroup mb={4} borderColor="#DAE3F0">
                  <Input
                    id="decimals"
                    size="sm"
                    onChange={e => setXDaiRPC(e.target.value)}
                    _placeholder={{ color: 'grey' }}
                    value={xdaiRPC}
                  />
                </InputGroup>
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
                  ref={initialRef}
                >
                  Back
                </Button>
                <Button
                  px={12}
                  onClick={onSave}
                  colorScheme="blue"
                  mt={{ base: 2, md: 0 }}
                  isDisabled={!isChanged}
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
