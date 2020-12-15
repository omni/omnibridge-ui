import { Checkbox, Flex, Grid, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';

import { useUserHistory } from '../lib/history';
import { HistoryItem } from './HistoryItem';
import { HistoryPagination } from './HistoryPagination';
import { LoadingModal } from './LoadingModal';
import { NoHistory } from './NoHistory';

const TOTAL_PER_PAGE = 10;

export const BridgeHistory = ({ page }) => {
  const [onlyUnReceived, setOnlyUnReceived] = useState(false);

  const { transfers, loading } = useUserHistory();
  if (loading)
    return (
      <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
        <LoadingModal loadingProps />
      </Flex>
    );
  const filteredTransfers = onlyUnReceived
    ? transfers.filter(i => i.receivingTx === null)
    : transfers;

  const numPages = Math.ceil(filteredTransfers.length / TOTAL_PER_PAGE);
  const displayHistory = filteredTransfers.slice(
    (page - 1) * TOTAL_PER_PAGE,
    Math.min(page * TOTAL_PER_PAGE, filteredTransfers.length),
  );

  if (page > numPages) {
    return <Redirect to="/history" />;
  }

  return (
    <Flex maxW="75rem" direction="column" mt={8} mx={8} w="calc(100% - 4rem)">
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          History
        </Text>
        <Checkbox
          isChecked={onlyUnReceived}
          onChange={e => setOnlyUnReceived(e.target.checked)}
          borderColor="grey"
          borderRadius="4px"
        >
          Show only unreceived
        </Checkbox>
      </Flex>

      {transfers && transfers.length > 0 ? (
        <>
          <Grid
            // templateColumns={{ base: '2fr 2fr', md: '2fr 3fr' }}
            templateColumns="1fr 1.25fr 1fr 1fr 1.25fr 0.5fr"
            color="grey"
            fontSize="sm"
            px={4}
            mb={4}
          >
            <Text>Date</Text>
            <Text>Direction</Text>
            <Text>Sending Tx</Text>
            <Text>Receiving Tx</Text>
            <Text>Amount</Text>
            <Text>Status</Text>
          </Grid>
          {displayHistory.map(item => (
            <HistoryItem key={item.sendingTx} data={item} />
          ))}
          {numPages && (
            <HistoryPagination numPages={numPages} currentPage={page} />
          )}
        </>
      ) : (
        <NoHistory />
      )}
    </Flex>
  );
};
