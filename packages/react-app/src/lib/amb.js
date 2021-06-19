import { Contract, utils } from 'ethers';
import { logError } from 'lib/helpers';

export const TOKENS_CLAIMED = 'Tokens already claimed';

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
  { messageData, signatures },
) => {
  const abi = [
    'function executeSignatures(bytes messageData, bytes signatures) external',
    'function safeExecuteSignaturesWithAutoGasLimit(bytes _data, bytes _signatures) external',
  ];
  const ambContract = new Contract(address, abi, ethersProvider.getSigner());

  let executeSignaturesFunc = ambContract.executeSignatures;
  if (version.major > 5 || (version.major === 5 && version.minor > 6)) {
    executeSignaturesFunc = ambContract.safeExecuteSignaturesWithAutoGasLimit;
  }

  try {
    const signs = packSignatures(signatures.map(s => signatureToVRS(s)));
    const tx = await executeSignaturesFunc(messageData, signs);
    return tx;
  } catch (error) {
    if (error?.code.toString() === '-32016') {
      throw new Error(TOKENS_CLAIMED);
    } else {
      throw error;
    }
  }
};
