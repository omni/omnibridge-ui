import { Flex, Grid, Text, Checkbox } from '@chakra-ui/react';
import React, { useContext, useEffect, useState } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { fetchHistory, fetchNumHistory } from '../lib/history';
import { HistoryItem } from './HistoryItem';
import { HistoryPagination } from './HistoryPagination';
import { NoHistory } from './NoHistory';
import { LoadingModal } from './LoadingModal';

export const BridgeHistory = ({ page }) => {
  const [history, setHistory] = useState();
  const [loading, setLoading] = useState(true);
  const { network, account } = useContext(Web3Context);
  const [numPages, setNumPages] = useState(0);
  const [onlyReceived, setOnlyReceived] = useState(false);

  useEffect(() => {
    async function getHistory() {
      setLoading(true);
      const [gotHistory, totalItems] = await Promise.all([
        fetchHistory(network.value, account, page),
        fetchNumHistory(network.value, account),
      ]);
      setHistory(gotHistory);
      setNumPages(Math.ceil(totalItems / 10));
      setLoading(false);
    }
    getHistory();
  }, [network, account, setHistory, page]);
  return (
    <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
      <LoadingModal loadingProps={loading} />
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold" mb={4}>
          History
        </Text>
        <Checkbox
          isChecked={onlyReceived}
          onChange={e => setOnlyReceived(e.target.checked)}
          borderColor="grey"
          borderRadius="4px"
        >
          Show only unreceived
        </Checkbox>
      </Flex>

      {history && history.length > 0 ? (
        <>
          <Grid
            templateColumns={{ base: '2fr 2fr', md: '2fr 3fr' }}
            color="grey"
            fontSize="sm"
            px={{ base: 4, sm: 8 }}
            mb={4}
          >
            <Text>Date</Text>
            <Text>Txn Hash</Text>
          </Grid>
          {history.map(item => (
            <HistoryItem
              key={item.txHash}
              chainId={network.value}
              date={item.timestamp}
              hash={item.txHash}
            />
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
