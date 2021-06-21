import {
  Button,
  Flex,
  Image,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import Logo from 'assets/logo.svg';
import { BridgeDropdown } from 'components/common/BridgeDropdown';
import { UpdateSettings } from 'components/common/UpdateSettings';
import { WalletSelector } from 'components/common/WalletSelector';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import { HistoryIcon } from 'icons/HistoryIcon';
import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

const HistoryLink = ({ close }) => {
  const history = useHistory();
  return (
    <Button
      variant="ghost"
      color="grey"
      _hover={{ color: 'blue.500', bgColor: 'blackAlpha.100' }}
      onClick={() => {
        history.push('/history');
        close();
      }}
      leftIcon={<HistoryIcon />}
      px={2}
      fontSize="sm"
    >
      <Text color="black"> History</Text>
    </Button>
  );
};

export const Header = () => {
  const { homeChainId, foreignChainId } = useBridgeDirection();
  const { account, providerChainId } = useWeb3Context();
  const [isOpen, setOpen] = useState(false);
  const toggleOpen = () => setOpen(open => !open);
  const valid =
    !!account && [homeChainId, foreignChainId].indexOf(providerChainId) >= 0;
  const isSmallScreen = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      justify="space-between"
      position={{ base: isOpen ? 'fixed' : 'relative', md: 'relative' }}
      top={isOpen ? 0 : undefined}
      left={isOpen ? 0 : undefined}
      align={{ base: 'stretch', md: 'center' }}
      maxW="75rem"
      minH={20}
      px={{ base: 4, sm: 8 }}
      w="100%"
      background={isOpen ? { base: 'white', md: 'transparent' } : 'transparent'}
      direction={{ base: 'column', md: 'row' }}
      mb={isOpen ? { base: 4, md: 0 } : 0}
      boxShadow={
        isOpen ? { base: '0 0.5rem 1rem #CADAEF', md: 'none' } : 'none'
      }
      h={isOpen && isSmallScreen ? '100%' : undefined}
      zIndex={isOpen ? 5 : undefined}
    >
      <Flex justify="space-between" h={20} align="center">
        <Link to="/">
          <Flex justify="space-around" align="center">
            <Image src={Logo} mr={4} />
            <Text fontWeight="bold">OmniBridge</Text>
          </Flex>
        </Link>
        <Button
          variant="link"
          display={{ base: 'block', md: 'none' }}
          color="blue.500"
          _hover={{ color: 'blue.600' }}
          onClick={toggleOpen}
          minW="auto"
          p="2"
        >
          {!isOpen && (
            <svg fill="currentColor" width="1.5rem" viewBox="0 0 20 20">
              <title>Menu</title>
              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
            </svg>
          )}
          {isOpen && (
            <svg width="1.25rem" viewBox="0 0 18 18" fill="none">
              <title>Close</title>
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M17.2923 17.2923C16.9011 17.6835 16.2669 17.6835 15.8757 17.2923L8.79285 10.2094L1.70996 17.2923C1.31878 17.6835 0.684559 17.6835 0.293382 17.2923C-0.0977942 16.9011 -0.0977941 16.2669 0.293383 15.8757L7.37627 8.79285L0.293383 1.70996C-0.0977941 1.31878 -0.0977942 0.684559 0.293382 0.293382C0.684559 -0.0977943 1.31878 -0.097794 1.70996 0.293383L8.79285 7.37627L15.8757 0.293407C16.2669 -0.09777 16.9011 -0.0977703 17.2923 0.293406C17.6835 0.684583 17.6835 1.31881 17.2923 1.70998L10.2094 8.79285L17.2923 15.8757C17.6835 16.2669 17.6835 16.9011 17.2923 17.2923Z"
                fill="currentColor"
              />
            </svg>
          )}
        </Button>
      </Flex>
      <Stack
        position={{ base: 'relative', md: 'static' }}
        direction={{ base: 'column', md: 'row' }}
        display={{ base: isOpen ? 'flex' : 'none', md: 'flex' }}
        w={{ base: '100%', md: 'auto' }}
        h={{ base: '100%', md: 'auto' }}
        align="center"
        justify="center"
        spacing={{ base: 2, md: 0, lg: 2 }}
      >
        {valid && (
          <>
            <HistoryLink close={() => setOpen(false)} />
            <UpdateSettings close={() => setOpen(false)} />
          </>
        )}
        <WalletSelector close={() => setOpen(false)} />
        <BridgeDropdown close={() => setOpen(false)} />
      </Stack>
    </Flex>
  );
};
