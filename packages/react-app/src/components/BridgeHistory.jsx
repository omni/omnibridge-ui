import { Flex, Grid, Text, Checkbox } from '@chakra-ui/react';
import React, { useState } from 'react';

import { useUserHistory } from '../lib/history';
import { HistoryItem } from './HistoryItem';
// import { HistoryPagination } from './HistoryPagination';
import { NoHistory } from './NoHistory';
import { LoadingModal } from './LoadingModal';

export const BridgeHistory = (/*{ page }*/) => {
  // const [loading, setLoading] = useState(true);
  // const [numPages, setNumPages] = useState(0);
  const [onlyUnReceived, setOnlyUnReceived] = useState(false);

  //useEffect(() => {
  //  async function getHistory() {
  //    setLoading(true);
  //    const [gotHistory, totalItems] = await Promise.all([
  //      fetchHistory(network.value, account, page),
  //      fetchNumHistory(network.value, account),
  //    ]);
  //    setHistory(gotHistory);
  //    console.log(totalItems);
  //    setNumPages(0);
  //    //setNumPages(Math.ceil(totalItems / 10));
  //    setLoading(false);
  //  }
  //  getHistory();
  //}, [network, account, setHistory, page]);
  //
  const { transfers: history, loading } = useUserHistory();
  const filteredHistory = onlyUnReceived
    ? history.filter(i => i.receivingTx === null)
    : history;

  return (
    <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
      {loading ? (
        <LoadingModal loadingProps={loading} />
      ) : (
        <>
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

          {history && history.length > 0 ? (
            <>
              <Grid
                //templateColumns={{ base: '2fr 2fr', md: '2fr 3fr' }}
                templateColumns="1fr 1.25fr 1fr 1fr 1.25fr 0.5fr"
                color="grey"
                fontSize="sm"
                px={{ base: 4, sm: 8 }}
                mb={4}
              >
                <Text>Date</Text>
                <Text>Direction</Text>
                <Text>Sending Tx</Text>
                <Text>Receiving Tx</Text>
                <Text>Amount</Text>
                <Text>Status</Text>
              </Grid>
              {filteredHistory.map(item => (
                <HistoryItem key={item.sendingTx} data={item} />
              ))}
              {/*numPages && (
            <HistoryPagination numPages={numPages} currentPage={page} />
          )*/}
            </>
          ) : (
            <NoHistory />
          )}
        </>
      )}
    </Flex>
  );
};
