import { gql, request } from 'graphql-request';
import { getBridgeNetwork, getGraphEndpoint } from 'lib/helpers';

const pageSize = 1000;

const requestsQuery = gql`
  query getRequests($user: String!, $first: Int!, $skip: Int!) {
    requests: userRequests(
      where: { user_contains: $user }
      orderBy: txHash
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      user
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        msgId
        msgData
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
    }
  }
`;

export const getExecutions = async (chainId, requests) => {
  const messageIds = requests.map(r => r.messageId);
  let executions = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(getGraphEndpoint(chainId), executionsQuery, {
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

export const getRequests = async (user, chainId) => {
  let requests = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(getGraphEndpoint(chainId), requestsQuery, {
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
) => {
  const bridgeChainId = getBridgeNetwork(chainId);
  return requests.map(req => {
    const execution = executions.find(exec => exec.messageId === req.messageId);
    return {
      user: req.user,
      chainId,
      timestamp: req.timestamp,
      sendingTx: req.txHash,
      receivingTx: execution ? execution.txHash : null,
      amount: req.amount,
      fromToken: {
        address: req.token,
        decimals: req.decimals,
        symbol: req.symbol,
        chainId,
      },
      toToken: {
        address: execution.token,
        decimals: req.decimals,
        symbol: req.symbol,
        chainId: bridgeChainId,
      },
      message: { ...req.message, messageId: req.messageId },
    };
  });
};
