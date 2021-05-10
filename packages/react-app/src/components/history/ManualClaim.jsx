import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useManualClaim } from 'hooks/useManualClaim';
import { logError } from 'lib/helpers';
import React, { useCallback, useState } from 'react';

export const ManualClaim = ({ handleClaimError }) => {
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const isInvalid = !txHash;
  const claim = useManualClaim();

  const toast = useToast();
  const showError = useCallback(
    msg => {
      if (msg) {
        toast({
          title: 'Error',
          description: msg,
          status: 'error',
          isClosable: 'true',
        });
      }
    },
    [toast],
  );

  const claimTokens = useCallback(async () => {
    if (isInvalid) return;
    setLoading(true);
    try {
      const { alreadyClaimed, data, error } = await claim(txHash);
      if (error) {
        throw error;
      }
      if (alreadyClaimed && !data) {
        handleClaimError();
        return;
      }
    } catch (manualClaimError) {
      logError({ manualClaimError });
      showError(manualClaimError.message);
    } finally {
      setLoading(false);
    }
  }, [claim, txHash, isInvalid, showError, handleClaimError]);

  return (
    <Flex
      w="100%"
      justify="space-between"
      mb="4"
      align="center"
      bg="white"
      p="1rem"
      borderRadius="0.5rem"
      boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      direction={{ base: 'column', lg: 'row' }}
    >
      <Flex
        direction="column"
        fontSize="sm"
        w="100%"
        minW={{ base: 'auto', lg: '25rem' }}
        mb={{ base: '2', lg: '0' }}
      >
        <Text color="black">
          Can&apos;t find your transfer to claim tokens?
        </Text>
        <Text color="greyText">
          Enter the transaction hash where the token transfer happened{' '}
        </Text>
      </Flex>
      <InputGroup>
        <Input
          borderColor="#DAE3F0"
          bg="white"
          fontSize="sm"
          placeholder="Transaction Hash"
          value={txHash}
          onChange={e => setTxHash(e.target.value)}
          pr="6rem"
        />
        <InputRightElement minW="6rem" pr="1">
          <Button
            w="100%"
            size="sm"
            colorScheme="blue"
            onClick={claimTokens}
            isDisabled={isInvalid}
            isLoading={loading}
          >
            Claim
          </Button>
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};
