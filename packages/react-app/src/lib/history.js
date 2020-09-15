import { gql, request } from 'graphql-request';

import { getGraphEndpoint } from './helpers';

const query = gql`
  query getHistory($recipient: String!, $skip: Int!) {
    bridgeTransfers(
      first: 10
      skip: $skip
      orderBy: timestamp
      where: { recipient_contains: $recipient }
      orderDirection: desc
    ) {
      txHash
      timestamp
    }
  }
`;

export const fetchHistory = async (chainId, recipient, page) => {
  if (!recipient) return { bridgeTransfers: [] };

  const endpoint = getGraphEndpoint(chainId);

  const variables = {
    recipient,
    skip: (page - 1) * 10,
  };

  return request(endpoint, query, variables);
};
