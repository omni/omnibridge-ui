import { Flex, Grid, Text } from '@chakra-ui/core';
import React, { useContext,useEffect, useState } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { getExplorerUrl } from '../lib/helpers';
import { fetchHistory } from '../lib/history';
import { HistoryItem } from './HistoryItem';

export const BridgeHistory = () => {
  const [history, setHistory] = useState();
  const [explorer, setExplorer] = useState();
  const { network, account } = useContext(Web3Context);
  useEffect(() => {
    async function getHistory() {
      const gotHistory = await fetchHistory(network.value, account);
      setHistory(gotHistory.bridgeTransfers);
    }
    getHistory();
    setExplorer(getExplorerUrl(network.bridge.chainId));
  }, [network, account, setHistory]);
  return (
    <Flex w="100%" maxW="75rem" direction="column" mt={8} px={8}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        History
      </Text>
      <Grid templateColumns="2fr 3fr" color="grey" fontSize="sm" px={8} mb={4}>
        <Text>Date</Text>
        <Text>Txn Hash</Text>
      </Grid>
      {history &&
        history.length > 0 &&
        history.map(item => (
          <HistoryItem
            explorer={explorer}
            date={new Date(parseInt(item.timestamp, 10) * 1000)}
            hash={item.txHash}
          />
        ))}
    </Flex>
  );
};
