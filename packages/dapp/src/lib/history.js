import { gql, request } from 'graphql-request';

import { ADDRESS_ZERO } from './constants';

const pageSize = 1000;

const requestsUserQuery = gql`
  query getRequests($user: String!, $first: Int!, $skip: Int!) {
    requests: userRequests(
      where: { user: $user }
      orderBy: txHash
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      user: recipient
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        messageId: msgId
        messageData: msgData
        signatures
      }
    }
  }
`;

const requestsRecipientQuery = gql`
  query getRequests($user: String!, $first: Int!, $skip: Int!) {
    requests: userRequests(
      where: { user_not: $user, recipient: $user }
      orderBy: txHash
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      user: recipient
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        messageId: msgId
        messageData: msgData
        signatures
      }
    }
  }
`;

const executionsQuery = gql`
  query getExecutions($first: Int!, $skip: Int!, $messageIds: [Bytes!]) {
    executions(
      where: { messageId_in: $messageIds }
      first: $first
      skip: $skip
      orderBy: txHash
      orderDirection: desc
    ) {
      txHash
      messageId
      token
      status
    }
  }
`;

export const getExecutions = async (graphEndpoint, requests) => {
  const messageIds = requests.map(r => r.messageId);
  let executions = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(graphEndpoint, executionsQuery, {
      first,
      skip: page * pageSize,
      messageIds,
    });
    if (data) {
      executions = data.executions.concat(executions);
    }
    if (!data || data.executions.length < pageSize) break;
    page += 1;
  }

  return { executions };
};

export const getRequests = async (user, graphEndpoint) => {
  const [userRequests, recipientRequests] = await Promise.all([
    getRequestsWithQuery(user, graphEndpoint, requestsUserQuery),
    getRequestsWithQuery(user, graphEndpoint, requestsRecipientQuery),
  ]);
  return {
    requests: [...userRequests.requests, ...recipientRequests.requests],
  };
};

export const getRequestsWithQuery = async (user, graphEndpoint, query) => {
  let requests = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(graphEndpoint, query, {
      user,
      first,
      skip: page * pageSize,
    });
    if (data) {
      requests = data.requests.concat(requests);
    }
    if (!data || data.requests.length < pageSize) break;
    page += 1;
  }

  return { requests };
};

export const combineRequestsWithExecutions = (
  requests,
  executions,
  chainId,
  bridgeChainId,
) =>
  requests.map(req => {
    const execution = executions.find(exec => exec.messageId === req.messageId);
    return {
      user: req.user,
      chainId,
      timestamp: req.timestamp,
      sendingTx: req.txHash,
      receivingTx: execution?.txHash,
      status: execution?.status,
      amount: req.amount,
      fromToken: {
        address: req.token,
        decimals: req.decimals,
        symbol: req.symbol,
        chainId,
      },
      toToken: {
        address: execution ? execution.token : ADDRESS_ZERO,
        decimals: req.decimals,
        symbol: req.symbol,
        chainId: bridgeChainId,
      },
      message: req.message,
    };
  });
