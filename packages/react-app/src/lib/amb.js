import { Contract, utils } from 'ethers';
import { gql, request } from 'graphql-request';
import { logError } from 'lib/helpers';

export const fetchConfirmations = async (address, ethersProvider) => {
  const abi = ['function requiredBlockConfirmations() view returns (uint256)'];
  const ambContract = new Contract(address, abi, ethersProvider);
  const requiredConfirmations = await ambContract
    .requiredBlockConfirmations()
    .catch(blockConfirmationsError => logError({ blockConfirmationsError }));
  return parseInt(requiredConfirmations, 10);
};

export const fetchAmbVersion = async (address, ethersProvider) => {
  if (!ethersProvider) {
    return { major: 0, minor: 0, patch: 0 };
  }
  const abi = [
    'function getBridgeInterfacesVersion() external pure returns (uint64, uint64, uint64)',
  ];
  const ambContract = new Contract(address, abi, ethersProvider);
  const ambVersion = await ambContract
    .getBridgeInterfacesVersion()
    .catch(versionError => logError({ versionError }));
  return {
    major: ambVersion[0].toNumber(),
    minor: ambVersion[1].toNumber(),
    patch: ambVersion[2].toNumber(),
  };
};

function strip0x(input) {
  return input.replace(/^0x/, '');
}

function signatureToVRS(rawSignature) {
  const signature = strip0x(rawSignature);
  const v = signature.substr(64 * 2);
  const r = signature.substr(0, 32 * 2);
  const s = signature.substr(32 * 2, 32 * 2);
  return { v, r, s };
}

function packSignatures(array) {
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

export const executeSignatures = async (
  ethersProvider,
  address,
  version,
  { msgData, signatures, messageId },
) => {
  let abi = [
    'function executeSignatures(bytes messageData, bytes signatures) external',
    'function messageCallStatus(bytes32 _messageId) external view returns (bool)',
  ];
  let ambContract = new Contract(address, abi, ethersProvider.getSigner());
  let executeSignaturesFunc = ambContract.executeSignatures;
  if (version.major > 5 || (version.major === 5 && version.minor > 6)) {
    abi = [
      'function safeExecuteSignaturesWithAutoGasLimit(bytes _data, bytes _signatures) external',
      'function messageCallStatus(bytes32 _messageId) external view returns (bool)',
    ];

    ambContract = new Contract(address, abi, ethersProvider.getSigner());
    executeSignaturesFunc = ambContract.safeExecuteSignaturesWithAutoGasLimit;
  }
  try {
    const signs = packSignatures(signatures.map(s => signatureToVRS(s)));
    const isExecutedAlready = await ambContract.messageCallStatus(messageId);
    if (isExecutedAlready) {
      return { alreadyClaimed: true, error: null, data: null };
    }
    return {
      alreadyClaimed: false,
      error: null,
      data: await executeSignaturesFunc(msgData, signs),
    };
  } catch (error) {
    if (error?.code === '-32016') {
      return { error: null, alreadyClaimed: true, data: null };
    }
    return { error, alreadyClaimed: false, data: null };
  }
};

const messagesTXQuery = gql`
  query getRequests($txHash: String!) {
    requests: userRequests(where: { txHash_contains: $txHash }, first: 1) {
      user
      recipient
      amount
      token
      decimals
      symbol
      message {
        msgId
        msgData
        signatures
      }
    }
  }
`;

export const getMessageFromTxHash = async (graphEndpoint, txHash) => {
  const data = await request(graphEndpoint, messagesTXQuery, {
    txHash,
  });

  return data &&
    data.requests &&
    data.requests.length > 0 &&
    data.requests[0].message
    ? {
        ...data.requests[0].message,
        ...data.requests[0],
      }
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

export const getMessageStatus = async (graphEndpoint, messageId) => {
  const data = await request(graphEndpoint, executionsQuery, {
    messageId,
  });

  return data && data.executions && data.executions.length > 0
    ? data.executions[0]
    : null;
};
