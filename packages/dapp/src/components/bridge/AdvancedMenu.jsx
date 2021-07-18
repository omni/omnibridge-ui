import { CloseIcon } from '@chakra-ui/icons';
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { ReactComponent as AdvancedImage } from 'assets/advanced.svg';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { utils } from 'ethers';
import React, { useCallback } from 'react';

export const AdvancedMenu = () => {
  const { isGnosisSafe } = useWeb3Context();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { receiver, setReceiver } = useBridgeContext();

  const isMenuOpen = isOpen || isGnosisSafe;

  const onClick = useCallback(() => {
    if (isMenuOpen) {
      setReceiver('');
      if (!isGnosisSafe) onClose();
    } else {
      onOpen();
    }
  }, [isMenuOpen, setReceiver, isGnosisSafe, onOpen, onClose]);

  return (
    <Flex
      position="relative"
      w="100%"
      color="greyText"
      align="center"
      justify="center"
    >
      <Flex
        w="100%"
        maxW="22rem"
        align="center"
        justify="center"
        direction="column"
        transition="all 0.25s"
        mx={4}
      >
        {isMenuOpen ? (
          <InputGroup>
            <Input
              borderColor="#DAE3F0"
              bg="white"
              placeholder="Recipient Address"
              _placeholder={{ color: 'greyText' }}
              color="black"
              value={receiver}
              onChange={e => setReceiver(e.target.value)}
              isInvalid={!!receiver && !utils.isAddress(receiver)}
              _focus={{ boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.6)' }}
              _invalid={{
                boxShadow: '0 0 0 3px #ef5d5d !important',
              }}
            />
            <InputRightElement>
              <CloseIcon
                as="button"
                boxSize="0.85rem"
                onClick={onClick}
                color="grey"
                transition="color 0.25s"
                _hover={{ color: 'blue.500', cursor: 'pointer' }}
              />
            </InputRightElement>
          </InputGroup>
        ) : (
          <Button
            onClick={onClick}
            color="blue.500"
            variant="ghost"
            h="2.5rem"
            fontWeight="normal"
            _hover={{ bg: 'blackAlpha.100' }}
            px="2"
          >
            <AdvancedImage width="1.25rem" />
            <Text ml={2}>{isMenuOpen ? 'Clear Recipient' : 'Advanced'}</Text>
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
