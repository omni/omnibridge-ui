import { gql, request } from 'graphql-request';

import { GRAPH_HEALTH_ENDPOINT, HOME_NETWORK } from './constants';
import { getBridgeNetwork, getSubgraphName, logError } from './helpers';

const FOREIGN_NETWORK = getBridgeNetwork(HOME_NETWORK);

const HOME_SUBGRAPH = getSubgraphName(HOME_NETWORK);
const FOREIGN_SUBGRAPH = getSubgraphName(FOREIGN_NETWORK);

const healthQuery = gql`
  query getHealthStatus($subgraphHome: String!, $subgraphForeign: String!) {
    homeHealth: indexingStatusForCurrentVersion(subgraphName: $subgraphHome) {
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
    foreignHealth: indexingStatusForCurrentVersion(
      subgraphName: $subgraphForeign
    ) {
      synced
      health
      fatalError {
        message
        block {
          number
          hash
        }
        handler
      }
      chains {
        chainHeadBlock {
          number
        }
        latestBlock {
          number
        }
      }
    }
  }
`;

const extractStatus = ({ fatalError, synced, chains }) => ({
  isReachable: true,
  isFailed: !!fatalError,
  isSynced: synced,
  latestBlockNumber: Number(chains[0].latestBlock.number),
});

const failedStatus = {
  isReachable: false,
  isFailed: true,
  isSynced: false,
  latestBlockNumber: 0,
};

export const getHealthStatus = async () => {
  try {
    const data = await request(GRAPH_HEALTH_ENDPOINT, healthQuery, {
      subgraphHome: HOME_SUBGRAPH,
      subgraphForeign: FOREIGN_SUBGRAPH,
    });
    return {
      homeHealth: extractStatus(data.homeHealth),
      foreignHealth: extractStatus(data.foreignHealth),
    };
  } catch (graphHealthError) {
    logError({ graphHealthError });
  }
  return {
    homeHealth: failedStatus,
    foreignHealth: failedStatus,
  };
};
