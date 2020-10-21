import { Contract, utils } from 'ethers';

import { getAMBAddress, getBridgeNetwork, isxDaiChain } from './helpers';
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
