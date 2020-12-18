import { gql, request } from 'graphql-request';
import { useContext, useEffect, useState } from 'react';

import { Web3Context } from '../contexts/Web3Context';
import { getBridgeNetwork, getGraphEndpoint } from './helpers';
import { CONFIG } from '../config';

const pageSize = 1000;

const historyQuery = gql`
  query getHistory($user: String!, $first: Int!, $skip: Int!) {
    requests: userRequests(
      where: { user_contains: $user }
      orderBy: txHash
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        msgData
        signatures
      }
    }
    executions(
      where: { user_contains: $user }
      first: $first
      skip: $skip
      orderBy: txHash
      orderDirection: desc
    ) {
      txHash
      messageId
    }
  }
`;

const requestsQuery = gql`
  query getRequests($user: String!, $first: Int!, $skip: Int!) {
    requests: userRequests(
      where: { user_contains: $user }
      orderBy: txHash
      orderDirection: desc
      first: $first
      skip: $skip
    ) {
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        msgData
        signatures
      }
    }
  }
`;

const executionsQuery = gql`
  query getRequests($user: String!, $first: Int!, $skip: Int!) {
    executions(
      where: { user_contains: $user }
      first: $first
      skip: $skip
      orderBy: txHash
      orderDirection: desc
    ) {
      txHash
      messageId
    }
  }
`;

export const getExecutions = async (user, chainId) => {
  let executions = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(getGraphEndpoint(chainId), executionsQuery, {
      user,
      first,
      skip: page * pageSize,
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

export const getTransfers = async (user, chainId) => {
  let requests = [];
  let executions = [];
  let page = 0;
  const first = pageSize;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const data = await request(getGraphEndpoint(chainId), historyQuery, {
      user,
      first,
      skip: page * pageSize,
    });
    if (data) {
      requests = data.requests.concat(requests);
      executions = data.executions.concat(executions);
    }
    if (
      !data ||
      (data.requests.length < pageSize && data.executions.length < pageSize)
    )
      break;
    page += 1;
  }

  return { requests, executions };
};

function combineRequestsWithExecutions(requests, executions, chainId) {
  return requests.map(req => {
    const execution = executions.find(exec => exec.messageId === req.messageId);
    return {
      chainId,
      timestamp: req.timestamp,
      sendingTx: req.txHash,
      receivingTx: execution ? execution.txHash : null,
      amount: req.amount,
      token: req.token,
      decimals: req.decimals,
      symbol: req.symbol,
      message: { ...req.message, messageId: req.messageId },
    };
  });
}

export function useUserHistory() {
  const { account } = useContext(Web3Context);
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(true);
  const chainId = CONFIG.network;

  useEffect(() => {
    if (!account || !chainId) return () => undefined;
    const bridgeChainId = getBridgeNetwork(chainId);
    async function update() {
      const [
        { requests: homeRequests, executions: homeExecutions },
        { requests: foreignRequests, executions: foreignExecutions },
      ] = await Promise.all([
        getTransfers(account, chainId),
        getTransfers(account, bridgeChainId),
      ]);
      const homeTransfers = combineRequestsWithExecutions(
        homeRequests,
        foreignExecutions,
        chainId,
      );
      const foreignTransfers = combineRequestsWithExecutions(
        foreignRequests,
        homeExecutions,
        bridgeChainId,
      );
      const allTransfers = [...homeTransfers, ...foreignTransfers].sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      setTransfers(allTransfers);
      setLoading(false);
    }
    setLoading(true);
    update();
    const interval = 10000; // 10 seconds
    const intervalId = setInterval(update, interval);
    return () => clearInterval(intervalId);
  }, [chainId, account]);

  return { transfers, loading };
}

export function useXDaiTransfers() {
  const { account } = useContext(Web3Context);
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(true);
  const chainId = CONFIG.network;

  useEffect(() => {
    if (!account || !chainId) return () => undefined;
    const bridgeChainId = getBridgeNetwork(chainId);
    async function update() {
      setLoading(true);
      const [{ requests }, { executions }] = await Promise.all([
        getRequests(account, chainId),
        getExecutions(account, bridgeChainId),
      ]);
      const xDaiTransfers = combineRequestsWithExecutions(
        requests,
        executions,
        chainId,
      ).sort((a, b) => b.timestamp - a.timestamp);
      setTransfers(xDaiTransfers);
      setLoading(false);
    }
    update();
    const interval = 10000; // 10 seconds
    const intervalId = setInterval(update, interval);
    return () => clearInterval(intervalId);
  }, [chainId, account]);

  return { transfers, loading };
}
