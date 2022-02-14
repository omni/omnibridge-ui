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
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import CustomTokenImage from 'assets/custom-token.svg';
import {
  ConfirmBSCTokenModal,
  shouldShowBSCTokenModal,
} from 'components/modals/ConfirmBSCTokenModal';
import { TokenWarnings } from 'components/warnings/TokenWarnings';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { utils } from 'ethers';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { useTokenDisabled } from 'hooks/useTokenDisabled';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import { logError, uniqueTokens } from 'lib/helpers';
import { ETH_BSC_BRIDGE } from 'lib/networks';
import { fetchTokenDetails } from 'lib/token';
import React, { useCallback, useMemo, useRef, useState } from 'react';

const { CUSTOM_TOKENS } = LOCAL_STORAGE_KEYS;

export const CustomTokenModal = ({ isOpen, onClose, onBack }) => {
  const { setToken, setLoading } = useBridgeContext();
  const { providerChainId } = useWeb3Context();
  const { bridgeDirection, getBridgeChainId } = useBridgeDirection();
  const bridgeChainId = useMemo(
    () => getBridgeChainId(providerChainId),
    [providerChainId, getBridgeChainId],
  );
  const [customToken, setCustomToken] = useState({
    address: '',
    name: '',
    symbol: '',
    decimals: 0,
    chainId: providerChainId,
    logo: '',
  });

  const [addressInput, setAddressInput] = useState('');
  const [addressInvalid, setAddressInvalid] = useState(false);

  const addCustomToken = useCallback(async () => {
    onClose();
    setLoading(true);
    let localTokensList = window.localStorage.getItem(CUSTOM_TOKENS);
    let customTokensList = [];

    if (!localTokensList) {
      localTokensList = [];
    }
    if (localTokensList.length < 1) {
      customTokensList = localTokensList.concat([customToken]);
    } else {
      customTokensList = JSON.parse(localTokensList);
      customTokensList.push(customToken);
    }
    customTokensList = uniqueTokens(customTokensList);
    window.localStorage.setItem(
      CUSTOM_TOKENS,
      JSON.stringify(customTokensList),
    );
    await setToken(customToken);
    setLoading(false);
  }, [onClose, customToken, setLoading, setToken]);

  const handleChange = useCallback(
    async e => {
      if (e.target.id === 'address') {
        setAddressInput(e.target.value);
        if (utils.isAddress(e.target.value)) {
          const tokenAddress = e.target.value;
          fetchTokenDetails(bridgeDirection, {
            chainId: providerChainId,
            address: tokenAddress,
          })
            .then(tokenDetails => {
              setAddressInvalid(false);
              setCustomToken(_customToken => ({
                ..._customToken,
                ...tokenDetails,
              }));
            })
            .catch(customTokenError => {
              logError({ customTokenError });
              setAddressInvalid(true);
            });
        } else {
          setAddressInvalid(true);
        }
      } else {
        setCustomToken(_customToken => ({
          ..._customToken,
          [e.target.id]: e.target.value,
        }));
      }
    },
    [bridgeDirection, providerChainId],
  );

  const {
    isOpen: shouldShowWarning,
    onOpen: showWarning,
    onClose: closeWarning,
  } = useDisclosure();

  const onClick = useCallback(() => {
    if (
      bridgeDirection === ETH_BSC_BRIDGE &&
      shouldShowBSCTokenModal(customToken)
    ) {
      showWarning();
    } else {
      addCustomToken();
    }
  }, [customToken, addCustomToken, bridgeDirection, showWarning]);

  const isBridgingDisabled = useTokenDisabled(
    !addressInvalid ? customToken : undefined,
  );

  const initialRef = useRef();

  return (
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
          <ConfirmBSCTokenModal
            isOpen={!!customToken && shouldShowWarning}
            onClose={closeWarning}
            onConfirm={addCustomToken}
            token={customToken}
            bridgeChainId={bridgeChainId}
          />
          <ModalHeader p={6}>
            <Text>Add Custom Token</Text>
            <Image src={CustomTokenImage} w="100%" mt={4} />
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
              <Text mb={2}>Token Contract Address</Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="address"
                  placeholder="0xAbC ..."
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={addressInput}
                  ref={initialRef}
                  isInvalid={addressInvalid}
                />
              </InputGroup>
              <Text mb={2}>Token Symbol</Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="symbol"
                  placeholder="ETH"
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={customToken.symbol}
                />
              </InputGroup>
              <Text mb={2}>Decimals of Precision</Text>
              <InputGroup mb={4} borderColor="#DAE3F0">
                <Input
                  id="decimals"
                  placeholder="18"
                  size="sm"
                  onChange={handleChange}
                  _placeholder={{ color: 'grey' }}
                  value={customToken.decimals}
                />
              </InputGroup>
            </Flex>
          </ModalBody>
          <ModalFooter p={6} flexDirection="column">
            <TokenWarnings token={!addressInvalid ? customToken : undefined} />
            <Flex
              w="100%"
              justify="space-between"
              align={{ base: 'stretch', md: 'center' }}
              direction={{ base: 'column', md: 'row' }}
            >
              <Button
                px={12}
                onClick={onBack}
                background="background"
                _hover={{ background: '#bfd3f2' }}
                color="#687D9D"
              >
                Back
              </Button>
              <Button
                px={12}
                onClick={onClick}
                isDisabled={isBridgingDisabled}
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
