import { Contract, utils } from 'ethers';
import { logDebug, logError } from 'lib/helpers';

export const NOT_ENOUGH_COLLECTED_SIGNATURES =
  'Transaction to the bridge is found but oracles’ confirmations are not collected yet. Wait for a minute and try again.';

export const getMessageData = async (
  isHome,
  ethersProvider,
  txHash,
  txReceipt,
) => {
  const abi = isHome
    ? new utils.Interface([
        'event UserRequestForSignature(bytes32 indexed messageId, bytes encodedData)',
      ])
    : new utils.Interface([
        'event UserRequestForAffirmation(bytes32 indexed messageId, bytes encodedData)',
      ]);
  let receipt = txReceipt;
  if (!receipt) {
    try {
      receipt = await ethersProvider.getTransactionReceipt(txHash);
    } catch (error) {
      throw Error('Invalid hash.');
    }
  }
  if (!receipt || !receipt.logs) {
    throw Error('No transaction found.');
  }
  const eventFragment = abi.events[Object.keys(abi.events)[0]];
  const eventTopic = abi.getEventTopic(eventFragment);
  const event = receipt.logs.find(e => e.topics[0] === eventTopic);
  if (!event) {
    throw Error(
      'It is not a bridge transaction. Specify hash of a transaction sending tokens to the bridge.',
    );
  }
  const decodedLog = abi.decodeEventLog(
    eventFragment,
    event.data,
    event.topics,
  );

  return {
    messageId: decodedLog.messageId,
    messageData: decodedLog.encodedData,
  };
};

export const getMessage = async (isHome, provider, ambAddress, txHash) => {
  const { messageId, messageData } = await getMessageData(
    isHome,
    provider,
    txHash,
  );
  const messageHash = utils.solidityKeccak256(['bytes'], [messageData]);

  const abi = [
    'function isAlreadyProcessed(uint256 _number) public pure returns (bool)',
    'function requiredSignatures() public view returns (uint256)',
    'function numMessagesSigned(bytes32 _message) public view returns (uint256)',
    'function signature(bytes32 _hash, uint256 _index) public view returns (bytes)',
  ];
  const ambContract = new Contract(ambAddress, abi, provider);
  const [requiredSignatures, numMessagesSigned] = await Promise.all([
    ambContract.requiredSignatures(),
    ambContract.numMessagesSigned(messageHash),
  ]);

  const isEnoughCollected = await ambContract.isAlreadyProcessed(
    numMessagesSigned,
  );
  if (!isEnoughCollected) {
    throw Error(NOT_ENOUGH_COLLECTED_SIGNATURES);
  }
  const signatures = await Promise.all(
    Array(requiredSignatures.toNumber())
      .fill(null)
      .map((_item, index) => ambContract.signature(messageHash, index)),
  );
  return {
    messageData,
    signatures,
    messageId,
  };
};

export const messageCallStatus = async (
  ambAddress,
  ethersProvider,
  messageId,
) => {
  const abi = [
    'function messageCallStatus(bytes32 _messageId) public view returns (bool)',
  ];
  const ambContract = new Contract(ambAddress, abi, ethersProvider);
  const claimed = await ambContract.messageCallStatus(messageId);
  return claimed;
};

export const fetchRequiredSignatures = async (homeAmbAddress, homeProvider) => {
  const abi = ['function requiredSignatures() public view returns (uint256)'];
  const ambContract = new Contract(homeAmbAddress, abi, homeProvider);
  const numRequired = await ambContract.requiredSignatures();
  return numRequired;
};

export const fetchValidatorList = async (homeAmbAddress, homeProvider) => {
  const ambContract = new Contract(
    homeAmbAddress,
    ['function validatorContract() public view returns (address)'],
    homeProvider,
  );
  const validatorContractAddress = await ambContract.validatorContract();
  const validatorContract = new Contract(
    validatorContractAddress,
    ['function validatorList() public view returns (address[])'],
    homeProvider,
  );
  const validatorList = await validatorContract.validatorList();
  return validatorList;
};

export const getRemainingSignatures = (
  messageData,
  signaturesCollected,
  requiredSignatures,
  validatorList,
) => {
  const signatures = [];
  const remainingValidators = Object.fromEntries(
    validatorList.map(validator => [validator, true]),
  );
  for (
    let i = 0;
    i < signaturesCollected.length && signatures.length < requiredSignatures;
    i += 1
  ) {
    const signer = utils.recoverAddress(messageData, signaturesCollected[i]);
    if (validatorList.includes(signer)) {
      delete remainingValidators[signer];
      signatures.push(signaturesCollected[i]);
    }
  }
  if (signatures.length < requiredSignatures) {
    logDebug(
      'On-chain collected signatures are not enough for message execution',
    );
    const manualValidators = Object.keys(remainingValidators);
    const msgHash = utils.keccak256(messageData);
    for (
      let i = 0;
      i < manualValidators.length && signatures.length < requiredSignatures;
      i += 1
    ) {
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const overrideSignatures = require(`../snapshots/signatures_${manualValidators[i]}.json`);
        if (overrideSignatures[msgHash]) {
          logDebug(`Adding manual signature from ${manualValidators[i]}`);
          signatures.push(overrideSignatures[msgHash]);
        } else {
          logDebug(`No manual signature from ${manualValidators[i]} was found`);
        }
      } catch (e) {
        logError(
          `Signatures overrides are not present for ${manualValidators[i]}`,
        );
      }
    }
  }
  return signatures;
};
