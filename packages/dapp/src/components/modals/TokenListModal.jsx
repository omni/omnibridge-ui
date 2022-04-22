import {
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import SearchIcon from 'assets/search.svg';
import { Logo } from 'components/common/Logo';
import {
  ConfirmBSCTokenModal,
  shouldShowBSCTokenModal,
} from 'components/modals/ConfirmBSCTokenModal';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { PlusIcon } from 'icons/PlusIcon';
import { LOCAL_STORAGE_KEYS } from 'lib/constants';
import {
  formatValue,
  getNativeCurrency,
  logError,
  uniqueTokens,
} from 'lib/helpers';
import { ETH_BSC_BRIDGE } from 'lib/networks';
import { fetchTokenBalanceWithProvider } from 'lib/token';
import { fetchTokenList } from 'lib/tokenList';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const { CUSTOM_TOKENS } = LOCAL_STORAGE_KEYS;

const TokenDisplay = ({ token, onClick }) => {
  const { ethersProvider, account } = useWeb3Context();
  const { decimals, name, logoURI, symbol, address, mode, chainId } = token;
  const { disableBalanceFetchToken } = useSettings();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState();

  useEffect(() => {
    (async () => {
      if (!ethersProvider || !account || disableBalanceFetchToken) return;
      setLoading(true);
      try {
        const b = await fetchTokenBalanceWithProvider(
          ethersProvider,
          { address, mode },
          account,
        );
        setBalance(b);
      } catch (error) {
        logError(`Error fetching balance for ${address}-${symbol}`, error);
      } finally {
        setLoading(false);
      }
    })();
  }, [
    ethersProvider,
    account,
    address,
    mode,
    symbol,
    disableBalanceFetchToken,
  ]);

  const desc =
    balance && decimals && !disableBalanceFetchToken
      ? formatValue(balance, decimals)
      : name;

  return (
    <Button
      variant="outline"
      size="lg"
      width="100%"
      borderColor="#DAE3F0"
      onClick={() => onClick(token)}
      mb={2}
      px={4}
    >
      <Flex align="center" width="100%" justify="space-between">
        <Flex align="center">
          <Flex
            justify="center"
            align="center"
            background="white"
            border="1px solid #DAE3F0"
            boxSize={8}
            overflow="hidden"
            borderRadius="50%"
          >
            <Logo uri={logoURI} chainId={chainId} />
          </Flex>
          <Text fontSize="lg" fontWeight="bold" mx={2}>
            {symbol}
          </Text>
        </Flex>
        {loading ? (
          <Spinner size="sm" speed="0.5s" />
        ) : (
          <Text
            color="grey"
            fontWeight="normal"
            textOverflow="ellipsis"
            overflow="hidden"
            maxWidth="60%"
          >
            {desc}
          </Text>
        )}
      </Flex>
    </Button>
  );
};

export const TokenListModal = ({ isOpen, onClose, onCustom }) => {
  // Ref
  const initialRef = useRef();
  // Contexts
  const {
    fromToken,
    setToken,
    setLoading: setBridgeLoading,
  } = useBridgeContext();
  const { chainId } = fromToken ?? {};

  // State
  const [loading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState([]);
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const smallScreen = useBreakpointValue({ sm: false, base: true });
  const {
    bridgeDirection,
    getBridgeChainId,
    foreignChainId,
    getGraphEndpoint,
    enableForeignCurrencyBridge,
  } = useBridgeDirection();

  const [customTokens, setCustomTokens] = useState([]);

  // Effects
  useEffect(() => {
    (async () => {
      if (!chainId) return;
      setLoading(true);
      try {
        const baseTokenList = await fetchTokenList(
          chainId,
          getGraphEndpoint(chainId),
          getGraphEndpoint(getBridgeChainId(chainId)),
        );

        const nativeCurrency =
          enableForeignCurrencyBridge && foreignChainId === chainId
            ? [getNativeCurrency(chainId)]
            : [];

        const customTokenList = [
          ...nativeCurrency,
          ...uniqueTokens(
            baseTokenList.concat(
              customTokens.filter(token => token.chainId === chainId),
            ),
          ),
        ];

        setTokenList(customTokenList);
      } catch (fetchTokensError) {
        logError({ fetchTokensError });
      }
      setLoading(false);
    })();
  }, [
    chainId,
    getGraphEndpoint,
    getBridgeChainId,
    enableForeignCurrencyBridge,
    foreignChainId,
    customTokens,
  ]);

  useEffect(() => {
    if (tokenList.length) {
      setFilteredTokenList(tokenList);
    }
  }, [tokenList, setFilteredTokenList]);

  useEffect(() => {
    if (isOpen) {
      const localTokenList = window.localStorage.getItem(CUSTOM_TOKENS);
      if (localTokenList && localTokenList !== JSON.stringify(customTokens)) {
        setCustomTokens(JSON.parse(localTokenList));
      }
    }
  }, [isOpen, customTokens]);

  // Handlers
  const selectToken = useCallback(
    async token => {
      onClose();
      setBridgeLoading(true);
      await setToken(token);
      setBridgeLoading(false);
    },
    [setBridgeLoading, onClose, setToken],
  );

  const {
    isOpen: shouldShowWarning,
    onOpen: showWarning,
    onClose: closeWarning,
  } = useDisclosure();

  const [selectedToken, setSelectedToken] = useState();

  const onConfirmWarningModal = useCallback(() => {
    selectToken(selectedToken);
  }, [selectedToken, selectToken]);

  const onClick = useCallback(
    async token => {
      setSelectedToken(token);
      if (
        bridgeDirection === ETH_BSC_BRIDGE &&
        shouldShowBSCTokenModal(token)
      ) {
        showWarning();
      } else {
        selectToken(token);
      }
    },
    [selectToken, bridgeDirection, showWarning],
  );

  const onChange = e => {
    const newFilteredTokenList = tokenList.filter(token => {
      const lowercaseSearch = e.target.value.toLowerCase();
      const { name, symbol, address } = token;
      return (
        name.toLowerCase().includes(lowercaseSearch) ||
        symbol.toLowerCase().includes(lowercaseSearch) ||
        address.toLowerCase().includes(lowercaseSearch)
      );
    });
    setFilteredTokenList(newFilteredTokenList);
  };

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
          pb={4}
          pt={2}
          maxW="37rem"
          mx="12"
        >
          {chainId && (
            <ConfirmBSCTokenModal
              isOpen={!!selectedToken && shouldShowWarning}
              onClose={closeWarning}
              onConfirm={onConfirmWarningModal}
              token={selectedToken}
              bridgeChainId={getBridgeChainId(chainId)}
            />
          )}
          <ModalHeader pb={0}>
            <Flex align="center" justify="space-between">
              Select a Token
              <Link
                fontSize="md"
                color="blue.500"
                fontWeight="normal"
                onClick={onCustom}
              >
                <Flex align="center">
                  <PlusIcon mr={2} />
                  <Text>{smallScreen ? 'Custom' : 'Add Custom Token'}</Text>
                </Flex>
              </Link>
            </Flex>
            <Text color="grey" my={2} fontSize="md" fontWeight="normal">
              Search Name or Paste Token Contract Address
            </Text>
            <InputGroup mb={4} borderColor="#DAE3F0">
              <Input
                placeholder="Search ..."
                onChange={onChange}
                _placeholder={{ color: 'grey' }}
                ref={initialRef}
              />
              <InputRightElement px={0}>
                <Image src={SearchIcon} />
              </InputRightElement>
            </InputGroup>
          </ModalHeader>
          <ModalCloseButton
            size="lg"
            top={-10}
            right={-10}
            color="white"
            p={2}
          />
          <ModalBody minH="5rem">
            {loading ? (
              <Flex w="100%" align="center" justify="center">
                <Spinner
                  color="blue.500"
                  thickness="4px"
                  size="xl"
                  speed="0.75s"
                />
              </Flex>
            ) : (
              filteredTokenList.map(token => (
                <TokenDisplay key={token.address} {...{ token, onClick }} />
              ))
            )}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
