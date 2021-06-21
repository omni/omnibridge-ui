import {
  Button,
  Flex,
  Image,
  Input,
  Spinner,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import DropDown from 'assets/drop-down.svg';
import { Logo } from 'components/common/Logo';
import { SelectTokenModal } from 'components/modals/SelectTokenModal';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { BigNumber, utils } from 'ethers';
import { formatValue, logError, truncateText } from 'lib/helpers';
import { fetchTokenBalance } from 'lib/token';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const useDelay = (fn, ms) => {
  const timer = useRef(0);

  const delayCallBack = useCallback(
    (...args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(fn.bind(this, ...args), ms || 0);
    },
    [fn, ms],
  );

  return delayCallBack;
};

export const FromToken = () => {
  const { account, providerChainId: chainId } = useWeb3Context();
  const {
    txHash,
    fromToken: token,
    fromBalance: balance,
    setFromBalance: setBalance,
    setAmount,
    amountInput: input,
    setAmountInput: setInput,
  } = useBridgeContext();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const smallScreen = useBreakpointValue({ base: true, lg: false });
  const [balanceLoading, setBalanceLoading] = useState(false);
  const updateAmount = useCallback(() => {
    setAmount(input);
  }, [input, setAmount]);
  const delayedSetAmount = useDelay(updateAmount, 500);

  useEffect(() => {
    let isSubscribed = true;
    if (token && account && chainId === token.chainId) {
      setBalanceLoading(true);
      fetchTokenBalance(token, account)
        .catch(fromBalanceError => {
          logError({ fromBalanceError });
          if (isSubscribed) {
            setBalance(BigNumber.from(0));
            setBalanceLoading(false);
          }
        })
        .then(b => {
          if (isSubscribed) {
            setBalance(b);
            setBalanceLoading(false);
          }
        });
    } else {
      setBalance(BigNumber.from(0));
    }
    return () => {
      isSubscribed = false;
    };
  }, [txHash, token, account, setBalance, setBalanceLoading, chainId]);

  return (
    <Flex
      align="center"
      m={{ base: 2, lg: 0 }}
      mr={{ base: 2, lg: -6 }}
      position="relative"
      borderRadius="0.25rem"
      border={{ base: '1px solid #DAE3F0', lg: 'none' }}
      minH={smallScreen ? '5rem' : 8}
      minW={smallScreen ? '15rem' : undefined}
    >
      <SelectTokenModal onClose={onClose} isOpen={isOpen} />
      {!smallScreen && (
        <svg width="100%" viewBox="0 0 381 94" fill="none">
          <path
            d="M359.745 4.703A7.5 7.5 0 00353.008.5H8A7.5 7.5 0 00.5 8v78A7.5 7.5 0 008 93.5h345.008a7.5 7.5 0 006.737-4.203l19.085-39a7.499 7.499 0 000-6.594l-19.085-39z"
            fill="#fff"
            stroke="#DAE3F0"
          />
        </svg>
      )}
      {token && (
        <Flex
          position={{ base: 'relative', lg: 'absolute' }}
          h={{ base: 'auto', lg: '100%' }}
          w="100%"
          direction="column"
          py={{ base: 4, lg: 2, xl: 3, '2xl': 4 }}
          pl={4}
          pr={{ base: 4, lg: 8, xl: 10, '2xl': 12 }}
        >
          <Flex
            justify="space-between"
            align={{ base: 'stretch', sm: 'center', lg: 'flex-start' }}
            mb={2}
            direction={{ base: 'column', sm: 'row' }}
          >
            <Flex
              align="center"
              cursor="pointer"
              onClick={onOpen}
              zIndex={1}
              background="white"
            >
              <Flex
                justify="center"
                align="center"
                background="white"
                border="1px solid #DAE3F0"
                boxSize={8}
                overflow="hidden"
                borderRadius="50%"
              >
                <Logo uri={token.logoURI} />
              </Flex>
              <Text fontSize="lg" fontWeight="bold" mx={2}>
                {truncateText(token.name, 24)}
              </Text>
              <Image src={DropDown} cursor="pointer" />
            </Flex>
            <Flex
              flex={1}
              justify="flex-end"
              align="center"
              h="100%"
              position="relative"
              ml={{ base: undefined, sm: 2, md: undefined }}
            >
              {balanceLoading ? (
                <Spinner size="sm" color="grey" />
              ) : (
                <Text
                  color="grey"
                  textAlign="right"
                  fontSize={{ base: 'md', lg: 'sm', '2xl': 'md' }}
                  {...(smallScreen
                    ? {}
                    : { position: 'absolute', bottom: '4px', right: 0 })}
                >
                  {`Balance: ${formatValue(balance, token.decimals)}`}
                </Text>
              )}
            </Flex>
          </Flex>
          <Flex
            align="flex-end"
            flex={1}
            w="100%"
            {...(!smallScreen
              ? {
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  pr: { base: 4, lg: 8, xl: 10, '2xl': 12 },
                  pl: 4,
                  pb: { base: 4, lg: 2, xl: 3, '2xl': 4 },
                }
              : {})}
          >
            <Input
              flex={1}
              variant="unstyled"
              type="number"
              value={input}
              placeholder="0.0"
              textAlign="left"
              fontWeight="bold"
              onChange={e => setInput(e.target.value)}
              onKeyUp={delayedSetAmount}
              fontSize="2xl"
            />
            <Button
              ml={2}
              color="blue.500"
              bg="blue.50"
              size="sm"
              fontSize="sm"
              fontWeight="normal"
              _hover={{ bg: 'blue.100' }}
              onClick={() => {
                const amountInput = utils.formatUnits(balance, token.decimals);
                setAmount(amountInput);
                setInput(amountInput);
              }}
            >
              Max
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
