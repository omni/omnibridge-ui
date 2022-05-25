import { Contract, utils } from 'ethers';

import { logError } from './helpers';
import { getEthersProvider } from './providers';

const CHAINALYSIS_ORACLE_CONTRACT_ADDRESS =
  '0xFab69AF7B56330fa599A6b1032cDC341ca7eC2a3';

export const isSanctionedByChainalysis = async address => {
  const provider = await getEthersProvider(77);
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
