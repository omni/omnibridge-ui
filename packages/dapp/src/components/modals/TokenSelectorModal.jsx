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
} from '@chakra-ui/react';
import SearchIcon from 'assets/search.svg';
import { Logo } from 'components/common/Logo';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useSettings } from 'contexts/SettingsContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { PlusIcon } from 'icons/PlusIcon';
import { ADDRESS_ZERO, LOCAL_STORAGE_KEYS } from 'lib/constants';
import {
  formatValue,
  getNativeCurrency,
  logError,
  removeElement,
  uniqueTokens,
} from 'lib/helpers';
import { fetchTokenBalanceWithProvider } from 'lib/token';
import { fetchTokenList } from 'lib/tokenList';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const { CUSTOM_TOKENS } = LOCAL_STORAGE_KEYS;

export const TokenSelectorModal = ({ isOpen, onClose, onCustom }) => {
  // Ref
  const initialRef = useRef();
  // Contexts
  const { setToken, setLoading: setBridgeLoading } = useBridgeContext();
  const { account, ethersProvider, providerChainId } = useWeb3Context();
  const { disableBalanceFetchToken } = useSettings();
  // State
  const [loading, setLoading] = useState(true);
  const [tokenList, setTokenList] = useState([]);
  const [filteredTokenList, setFilteredTokenList] = useState([]);
  const smallScreen = useBreakpointValue({ sm: false, base: true });
  const {
    getBridgeChainId,
    foreignChainId,
    getGraphEndpoint,
    enableForeignCurrencyBridge,
  } = useBridgeDirection();

  // Callbacks
  const fetchTokenListWithBalance = useCallback(
    async tList => {
      const tokenValueSortFn = ({ balance: balanceA }, { balance: balanceB }) =>
        balanceB.sub(balanceA).gt(0) ? 1 : -1;

      const tokenListWithBalance = await Promise.all(
        tList.map(async token => ({
          ...token,
          balance: await fetchTokenBalanceWithProvider(
            ethersProvider,
            token,
            account,
          ),
        })),
      );

      const natCurIndex = tokenListWithBalance.findIndex(
        ({ address, mode }) => address === ADDRESS_ZERO && mode === 'NATIVE',
      );

      if (natCurIndex !== -1) {
        return [
          tokenListWithBalance[natCurIndex],
          ...removeElement(tokenListWithBalance, natCurIndex).sort(
            tokenValueSortFn,
          ),
        ];
      }

      return tokenListWithBalance.sort(tokenValueSortFn);
    },
    [account, ethersProvider],
  );

  const setDefaultTokenList = useCallback(
    async (chainId, customTokens) => {
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

        setTokenList(
          !disableBalanceFetchToken
            ? await fetchTokenListWithBalance(customTokenList)
            : customTokenList,
        );
      } catch (fetchTokensError) {
        logError({ fetchTokensError });
      }
      setLoading(false);
    },
    [
      getGraphEndpoint,
      getBridgeChainId,
      disableBalanceFetchToken,
      fetchTokenListWithBalance,
      enableForeignCurrencyBridge,
      foreignChainId,
    ],
  );

  // Effects
  useEffect(() => {
    tokenList.length && setFilteredTokenList(tokenList);
  }, [tokenList, setFilteredTokenList]);

  useEffect(() => {
    if (!isOpen) return;
    let localTokenList = window.localStorage.getItem(CUSTOM_TOKENS);
    localTokenList =
      !localTokenList || !localTokenList.length
        ? []
        : JSON.parse(localTokenList);
    providerChainId && setDefaultTokenList(providerChainId, localTokenList);
  }, [isOpen, providerChainId, setDefaultTokenList]);

  // Handlers
  const onClick = useCallback(
    async token => {
      setBridgeLoading(true);
      onClose();
      await setToken(token);
      setBridgeLoading(false);
    },
    [setBridgeLoading, onClose, setToken],
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
          maxW="30rem"
          mx={{ base: 12, lg: 0 }}
        >
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
            {loading && (
              <Flex w="100%" align="center" justify="center">
                <Spinner
                  color="blue.500"
                  thickness="4px"
                  size="xl"
                  speed="0.75s"
                />
              </Flex>
            )}
            {!loading &&
              filteredTokenList.map(token => {
                const { decimals, balance, name, address, logoURI, symbol } =
                  token;
                return (
                  <Button
                    variant="outline"
                    size="lg"
                    width="100%"
                    borderColor="#DAE3F0"
                    key={address + symbol}
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
                          <Logo uri={logoURI} />
                        </Flex>
                        <Text fontSize="lg" fontWeight="bold" mx={2}>
                          {symbol}
                        </Text>
                      </Flex>
                      <Text
                        color="grey"
                        fontWeight="normal"
                        textOverflow="ellipsis"
                        overflow="hidden"
                        maxWidth="60%"
                      >
                        {!disableBalanceFetchToken && balance && decimals
                          ? formatValue(balance, decimals)
                          : name}
                      </Text>
                    </Flex>
                  </Button>
                );
              })}
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
