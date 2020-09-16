import { gql, request } from 'graphql-request';

import { getGraphEndpoint } from './helpers';

const historyQuery = gql`
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
  if (!user) return [];

  const endpoint = getGraphEndpoint(chainId);

  const variables = {
    user,
    skip: (page - 1) * 10,
  };

  const data = await request(endpoint, historyQuery, variables);

  if (!data) return [];

  return data.userRequests;
};

const fullHistoryQuery = gql`
  query getFullHistory($user: String!) {
    userRequests(where: { user_contains: $user }) {
      id
    }
  }
`;

export const fetchNumHistory = async (chainId, user) => {
  if (!user) return 0;

  const endpoint = getGraphEndpoint(chainId);

  const variables = {
    user,
  };

  const data = await request(endpoint, fullHistoryQuery, variables);

  if (!data) return 0;

  return data.userRequests.length;
};
