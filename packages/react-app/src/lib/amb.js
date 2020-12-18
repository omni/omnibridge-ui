import { Contract, utils } from 'ethers';
import { gql, request } from 'graphql-request';

import {
  getAMBAddress,
  getBridgeNetwork,
  getGraphEndpoint,
  isxDaiChain,
} from './helpers';
import { getEthersProvider } from './providers';

export const fetchConfirmations = async (chainId, walletProvider) => {
  const abi = ['function requiredBlockConfirmations() view returns (uint256)'];
  const address = getAMBAddress(chainId);
  const ambContract = new Contract(address, abi, walletProvider);
  return ambContract.requiredBlockConfirmations();
};

export const getMessageId = (txReceipt, bridgeAddress, eventAbi) => {
  try {
    const abi = new utils.Interface([eventAbi]);
    const eventFragment = abi.events[Object.keys(abi.events)[0]];
    const eventTopic = abi.getEventTopic(eventFragment);
    const event = txReceipt.logs.find(
      e => e.address === bridgeAddress && e.topics[0] === eventTopic,
    );
    const decodedLog = abi.decodeEventLog(
      eventFragment,
      event.data,
      event.topics,
    );
    return decodedLog.messageId;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log({ messageIdError: error });
    return null;
  }
};

export const getMessageFromReceipt = (chainId, txReceipt) => {
  const isxDai = isxDaiChain(chainId);
  const bridgeAddress = getAMBAddress(chainId);
  const eventAbi = isxDai
    ? 'event UserRequestForSignature(bytes32 indexed messageId, bytes encodedData)'
    : 'event UserRequestForAffirmation(bytes32 indexed messageId, bytes encodedData)';
  return getMessageId(txReceipt, bridgeAddress, eventAbi);
};

export const getMessageCallStatus = (chainId, messageId) => {
  const abi = [
    'function messageCallStatus(bytes32 messageId) external view returns (bool)',
  ];
  const otherChainId = getBridgeNetwork(chainId);
  const address = getAMBAddress(otherChainId);
  const ethersProvider = getEthersProvider(otherChainId);
  const ambContract = new Contract(address, abi, ethersProvider);
  return ambContract.messageCallStatus(messageId);
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
  const ambContract = new Contract(address, abi, ethersProvider.getSigner());
  const tx = await ambContract.executeSignatures(message.msgData, signatures);
  await tx.wait();
  return tx.hash;
};

const messagesQuery = gql`
  query getMessage($txHash: String!) {
    messages(where: { txHash_contains: $txHash }, first: 1) {
      msgId
      msgData
      signatures
    }
  }
`;

export const getMessageFromTxHash = async (chainId, txHash) => {
  const data = await request(getGraphEndpoint(chainId), messagesQuery, {
    txHash,
  });

  return data && data.messages && data.messages.length > 0
    ? data.messages[0]
    : null;
};
