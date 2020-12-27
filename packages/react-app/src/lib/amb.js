import { Contract, utils } from 'ethers';
import { gql, request } from 'graphql-request';

import { getGasPrice } from './gasPrice';
import { getAMBAddress, getGraphEndpoint, logError } from './helpers';

export const fetchConfirmations = async (chainId, ethersProvider) => {
  const abi = ['function requiredBlockConfirmations() view returns (uint256)'];
  const address = getAMBAddress(chainId);
  const ambContract = new Contract(address, abi, ethersProvider);
  const requiredConfirmations = await ambContract
    .requiredBlockConfirmations()
    .catch(contractError => logError({ contractError }));
  return parseInt(requiredConfirmations, 10);
};

export function strip0x(input) {
  return input.replace(/^0x/, '');
}

export function signatureToVRS(rawSignature) {
  const signature = strip0x(rawSignature);
  const v = signature.substr(64 * 2);
  const r = signature.substr(0, 32 * 2);
  const s = signature.substr(32 * 2, 32 * 2);
  return { v, r, s };
}

export function packSignatures(array) {
  const length = strip0x(utils.hexValue(array.length));
  const msgLength = length.length === 1 ? `0${length}` : length;
  let v = '';
  let r = '';
  let s = '';
  array.forEach(e => {
    v = v.concat(e.v);
    r = r.concat(e.r);
    s = s.concat(e.s);
  });
  return `0x${msgLength}${v}${r}${s}`;
}

export const executeSignatures = async (ethersProvider, chainId, message) => {
  const abi = [
    'function executeSignatures(bytes messageData, bytes signatures) external',
  ];
  const signatures = packSignatures(
    message.signatures.map(s => signatureToVRS(s)),
  );
  const address = getAMBAddress(chainId);
  try {
    const ambContract = new Contract(address, abi, ethersProvider.getSigner());
    const gasPrice = getGasPrice(chainId);
    const tx = await ambContract
      .executeSignatures(message.msgData, signatures, {
        gasPrice,
      })
      .catch(contractError => logError({ contractError }));
    return tx;
  } catch (executeError) {
    logError({ executeError });
  }
  return null;
};

const messagesTXQuery = gql`
  query getMessage($txHash: String!) {
    messages(where: { txHash_contains: $txHash }, first: 1) {
      msgId
      msgData
      signatures
    }
  }
`;

export const getMessageFromTxHash = async (chainId, txHash) => {
  const data = await request(getGraphEndpoint(chainId), messagesTXQuery, {
    txHash,
  });

  return data && data.messages && data.messages.length > 0
    ? data.messages[0]
    : null;
};

const messagesIDQuery = gql`
  query getMessage($msgId: String!) {
    messages(where: { msgId_contains: $msgId }, first: 1) {
      msgId
      msgData
      signatures
    }
  }
`;

export const getMessageFromMessageID = async (chainId, msgId) => {
  const data = await request(getGraphEndpoint(chainId), messagesIDQuery, {
    msgId,
  });

  return data && data.messages && data.messages.length > 0
    ? { ...data.messages[0], messageId: msgId }
    : null;
};

const executionsQuery = gql`
  query getExecution($messageId: String!) {
    executions(where: { messageId_contains: $messageId }, first: 1) {
      txHash
      id
    }
  }
`;

export const getMessageStatus = async (chainId, messageId) => {
  const data = await request(getGraphEndpoint(chainId), executionsQuery, {
    messageId,
  });

  return data && data.executions && data.executions.length > 0
    ? data.executions[0]
    : null;
};
