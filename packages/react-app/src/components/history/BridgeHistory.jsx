import { Checkbox, Flex, Grid, Image, Text } from '@chakra-ui/react';
import AlertImage from 'assets/alert.svg';
import { HistoryItem } from 'components/history/HistoryItem';
import { HistoryPagination } from 'components/history/HistoryPagination';
import { ManualClaim } from 'components/history/ManualClaim';
import { NoHistory } from 'components/history/NoHistory';
import { LoadingModal } from 'components/modals/LoadingModal';
import { useGraphHealth } from 'hooks/useGraphHealth';
import { useUserHistory } from 'hooks/useUserHistory';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

const TOTAL_PER_PAGE = 20;

export const BridgeHistory = ({ page }) => {
  const [onlyUnReceived, setOnlyUnReceived] = useState(false);

  const { transfers, loading } = useUserHistory();
  const { foreignHealthy, homeHealthy } = useGraphHealth(
    'Cannot access history data. Wait for a few minutes and reload the application',
    {
      disableAlerts: true,
    },
  );

  if (loading) {
    return (
      <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
        <LoadingModal />
      </Flex>
    );
  }
  const filteredTransfers = onlyUnReceived
    ? transfers.filter(i => i.receivingTx === null)
    : transfers;

  const numPages = Math.ceil(filteredTransfers.length / TOTAL_PER_PAGE);
  const displayHistory = filteredTransfers.slice(
    (page - 1) * TOTAL_PER_PAGE,
    Math.min(page * TOTAL_PER_PAGE, filteredTransfers.length),
  );

  if (numPages > 1 && page > numPages) {
    return <Redirect to="/history" />;
  }

  return (
    <Flex
      maxW="75rem"
      direction="column"
      mt={8}
      px={{ base: 4, sm: 8 }}
      w="100%"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="bold">
          History
        </Text>
        <Checkbox
          isChecked={onlyUnReceived}
          onChange={e => setOnlyUnReceived(e.target.checked)}
          borderColor="grey"
          borderRadius="4px"
          size="lg"
          variant="solid"
        >
          <Text fontSize="sm">Show only unreceived</Text>
        </Checkbox>
      </Flex>

      {!(foreignHealthy && homeHealthy) && (
        <Flex w="100%" align="center" mb={4}>
          <Flex
            w="100%"
            borderRadius="0.5rem"
            border="1px solid #DAE3F0"
            bg="white"
          >
            <Flex
              bg="#FFF7EF"
              borderLeftRadius="0.5rem"
              border="1px solid #FFAA5C"
              justify="center"
              align="center"
              minW="4rem"
              maxW="4rem"
              flex={1}
            >
              <Image src={AlertImage} />
            </Flex>
            <Flex align="center" p={4}>
              <Text fontSize="0.75rem">
                The Graph service may not work properly and some transfers may
                not display. You can use the form below to claim your tokens.
              </Text>
            </Flex>
          </Flex>
        </Flex>
      )}

      <ManualClaim />

      {displayHistory.length > 0 ? (
        <>
          <Grid
            templateColumns={{
              base: '1fr',
              md: '0.5fr 1.75fr 1fr 1fr 1.25fr 0.5fr',
              lg: '1fr 1.25fr 1fr 1fr 1.25fr 0.5fr',
            }}
            color="grey"
            fontSize="sm"
            px={4}
            mb={4}
            display={{ base: 'none', md: 'grid' }}
          >
            <Text>Date</Text>
            <Text>Direction</Text>
            <Text textAlign="center">Sending Tx</Text>
            <Text textAlign="center">Receiving Tx</Text>
            <Text textAlign="center">Amount</Text>
            <Text textAlign="right">Status</Text>
          </Grid>
          {displayHistory.map(item => (
            <HistoryItem key={item.sendingTx} data={item} />
          ))}
          {numPages > 1 && (
            <HistoryPagination numPages={numPages} currentPage={page} />
          )}
        </>
      ) : (
        <NoHistory />
      )}
    </Flex>
  );
};
