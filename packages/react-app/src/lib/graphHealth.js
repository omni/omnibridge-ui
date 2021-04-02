import { gql, request } from 'graphql-request';
import { GRAPH_HEALTH_ENDPOINT } from 'lib/constants';
import { logError } from 'lib/helpers';

import { networks } from './networks';

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
  chainHeadBlockNumber: Number(chains[0].chainHeadBlock.number),
});

const failedStatus = {
  isReachable: false,
  isFailed: true,
  isSynced: false,
  latestBlockNumber: 0,
  chainHeadBlockNumber: 0,
};

export const getHealthStatus = async bridgeDirection => {
  const { homeGraphName, foreignGraphName } = networks[bridgeDirection];
  try {
    const data = await request(GRAPH_HEALTH_ENDPOINT, healthQuery, {
      subgraphHome: homeGraphName,
      subgraphForeign: foreignGraphName,
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
