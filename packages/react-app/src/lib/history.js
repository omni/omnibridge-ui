import { gql, request } from 'graphql-request';
import { useContext, useEffect, useState } from 'react';

import { BridgeContext } from '../contexts/BridgeContext';
import { Web3Context } from '../contexts/Web3Context';
import { HOME_NETWORK } from './constants';
import { getBridgeNetwork, getGraphEndpoint } from './helpers';

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

function combineRequestsWithExecutions(requests, executions, chainId) {
  return requests.map(req => {
    const execution = executions.find(exec => exec.messageId === req.messageId);
    return {
      user: req.user,
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
  const chainId = HOME_NETWORK;

  useEffect(() => {
    if (!account || !chainId) return;
    const bridgeChainId = getBridgeNetwork(chainId);
    async function update() {
      const [
        { requests: homeRequests },
        { requests: foreignRequests },
      ] = await Promise.all([
        getRequests(account, chainId),
        getRequests(account, bridgeChainId),
      ]);
      const [
        { executions: homeExecutions },
        { executions: foreignExecutions },
      ] = await Promise.all([
        getExecutions(chainId, foreignRequests),
        getExecutions(bridgeChainId, homeRequests),
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
    setTransfers();
    setLoading(true);
    update();
  }, [chainId, account]);

  return { transfers, loading };
}

export function useClaimableTransfers() {
  const { account, providerChainId } = useContext(Web3Context);
  const { txHash } = useContext(BridgeContext);
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account || !providerChainId) return;
    const chainId = HOME_NETWORK;
    const bridgeChainId = getBridgeNetwork(chainId);
    async function update() {
      setLoading(true);
      setTransfers();
      const { requests } = await getRequests(account, chainId);
      const { executions } = await getExecutions(bridgeChainId, requests);
      const xDaiTransfers = combineRequestsWithExecutions(
        requests,
        executions,
        chainId,
      )
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(t => !t.receivingTx);
      setTransfers(xDaiTransfers);
      setLoading(false);
    }
    update();
  }, [account, providerChainId, txHash]);

  return { transfers, loading };
}
