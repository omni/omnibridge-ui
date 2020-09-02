import { gql,request } from 'graphql-request';

import { getBridgeNetwork,getGraphEndpoint } from './helpers';

const query = gql`
  query getHistory($recipient: String!) {
    bridgeTransfers(
      orderBy: timestamp
      where: { recipient_contains: $recipient }
      orderDirection: desc
    ) {
      txHash
      timestamp
    }
  }
`;

export const fetchHistory = async (chainId, recipient) => {
  if (!recipient) return { bridgeTransfers: [] };
  const bridgeChainId = getBridgeNetwork(chainId);

  const endpoint = getGraphEndpoint(bridgeChainId);

  const variables = {
    recipient,
  };

  return request(endpoint, query, variables);
};
