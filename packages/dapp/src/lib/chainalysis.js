import { Contract, utils } from 'ethers';

import { logError } from './helpers';
import { getEthersProvider } from './providers';

const CHAINALYSIS_ORACLE_CONTRACT_ADDRESS =
  '0x40c57923924b5c5c5455c48d93317139addac8fb';

export const isSanctionedByChainalysis = async address => {
  const provider = await getEthersProvider(1);
  const abi = new utils.Interface([
    'function isSanctioned(address) view returns (bool)',
  ]);
  const oracle = new Contract(
    CHAINALYSIS_ORACLE_CONTRACT_ADDRESS,
    abi,
    provider,
  );
  let isSanctioned = false;
  try {
    isSanctioned = await oracle.isSanctioned(address);
  } catch (error) {
    logError('Chainalysis Oracle Error:', error);
  }
  return isSanctioned;
};
