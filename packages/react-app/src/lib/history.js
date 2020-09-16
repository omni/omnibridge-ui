import { gql, request } from 'graphql-request';

import { getGraphEndpoint } from './helpers';

const query = gql`
  query getHistory($user: String!, $skip: Int!) {
    userRequests(
      first: 10
      skip: $skip
      orderBy: timestamp
      where: { user_contains: $user }
      orderDirection: desc
    ) {
      txHash
      timestamp
    }
  }
`;

export const fetchHistory = async (chainId, user, page) => {
  if (!user) return { userRequests: [] };

  const endpoint = getGraphEndpoint(chainId);

  const variables = {
    user,
    skip: (page - 1) * 10,
  };

  return request(endpoint, query, variables);
};
