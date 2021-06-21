import { Alert, AlertIcon, Checkbox, Flex, Text } from '@chakra-ui/react';
import { useBridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import React from 'react';

export const GnosisSafeWarning = ({
  isChecked,
  setChecked,
  noShadow = false,
  noCheckbox = false,
}) => {
  const { isGnosisSafe, account } = useWeb3Context();
  const { receiver } = useBridgeContext();

  if (!isGnosisSafe) return null;
  const isSameAddress =
    account && receiver && account.toLowerCase() === receiver.toLowerCase();
  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      {(noCheckbox || isSameAddress) && (
        <Alert
          status="warning"
          borderRadius={5}
          mb={noCheckbox ? '0' : '4'}
          boxShadow={
            noShadow ? 'none' : '0px 1rem 2rem rgba(204, 218, 238, 0.8)'
          }
        >
          <AlertIcon minWidth="20px" />
          {noCheckbox && (
            <Text fontSize="small">
              It is mandatory to set an alternative recipient address when
              Omnibridge is loaded as a Gnosis Safe App. Usually this would be
              the address of a Gnosis Safe on the other side of the bridge.
            </Text>
          )}
          {isSameAddress && !noCheckbox && (
            <Text fontSize="small">
              You have specified the same address as the current Gnosis Safe
              wallet address.
            </Text>
          )}
        </Alert>
      )}
      {!noCheckbox && isSameAddress && (
        <Checkbox
          w="100%"
          isChecked={isChecked}
          onChange={e => setChecked(e.target.checked)}
          borderColor="grey"
          borderRadius="4px"
          size="lg"
          variant="solid"
        >
          <Text fontSize="sm">
            I agree to proceed and understand I will receive the funds on the
            same address on the other side of the bridge.
          </Text>
        </Checkbox>
      )}
    </Flex>
  );
};
