import { Alert, AlertIcon, Flex, Text } from '@chakra-ui/react';
import { useGraphHealth } from 'hooks/useGraphHealth';
import React from 'react';

export const GraphHealthWarning = () => {
  const { foreignHealthy, homeHealthy } = useGraphHealth(
    'Cannot access history data. Wait for a few minutes and reload the application',
    {
      disableAlerts: true,
    },
  );
  if (foreignHealthy && homeHealthy) return null;

  return (
    <Flex align="center" direction="column" w="100%" mb="4">
      <Alert
        status="warning"
        borderRadius={5}
        boxShadow="0px 1rem 2rem rgba(204, 218, 238, 0.8)"
      >
        <AlertIcon minWidth="20px" />
        <Text fontSize="small">
          The Graph service may not work properly and some transfers may not
          display. You can use the form below to claim your tokens. If your
          transfer is still displayed as unclaimed double check its status in
          AMB Live Monitoring app by clicking the link in the Sending Tx column.
        </Text>
      </Alert>
    </Flex>
  );
};
