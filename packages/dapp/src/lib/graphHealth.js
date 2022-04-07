import { gql, request } from 'graphql-request';
import { GRAPH_HEALTH_ENDPOINT } from 'lib/constants';
import { logError } from 'lib/helpers';

const healthQuery = gql`
  query getHealthStatus($subgraph: String!) {
    status: indexingStatusForCurrentVersion(subgraphName: $subgraph) {
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

export const getHealthStatus = async subgraph => {
  try {
    const data = await request(GRAPH_HEALTH_ENDPOINT, healthQuery, {
      subgraph,
    });
    return extractStatus(data.status);
  } catch (graphHealthError) {
    logError(`Error getting subgraph health for ${subgraph}`, graphHealthError);
    return failedStatus;
  }
};
