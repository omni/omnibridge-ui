import { Flex, Grid, Text } from '@chakra-ui/core';
import React, { useContext, useEffect, useState } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { getExplorerUrl } from '../lib/helpers';
import { fetchHistory } from '../lib/history';
import { HistoryItem } from './HistoryItem';
import { LoadingModal } from './LoadingModal';

export const BridgeHistory = ({ page }) => {
  const [history, setHistory] = useState();
  const [explorer, setExplorer] = useState();
  const [loading, setLoading] = useState(true);
  const { network, account } = useContext(Web3Context);
  useEffect(() => {
    async function getHistory() {
      const gotHistory = await fetchHistory(network.value, account, page);
      setHistory(gotHistory.bridgeTransfers);
      setLoading(false);
    }
    setExplorer(getExplorerUrl(network.chainId));
    getHistory();
  }, [network, account, setHistory, page]);
  return (
    <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
      <LoadingModal loadingProps={loading} />
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        History
      </Text>
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
      {!loading && history && history.length > 0 ? (
        history.map(item => (
          <HistoryItem
            key={item.txHash}
            explorer={explorer}
            date={item.timestamp}
            hash={item.txHash}
          />
        ))
      ) : (
        <Grid templateColumns="5fr" w="100%">
          <Text align="center">No History Found</Text>
        </Grid>
      )}
    </Flex>
  );
};
