import { useWeb3Context } from 'contexts/Web3Context';
import { BigNumber } from 'ethers';
import { LARGEST_UINT256, LOCAL_STORAGE_KEYS } from 'lib/constants';
import { logError } from 'lib/helpers';
import { approveToken, fetchAllowance } from 'lib/token';
import { useCallback, useEffect, useState } from 'react';

const { INFINITE_UNLOCK } = LOCAL_STORAGE_KEYS;

export const useApproval = (fromToken, fromAmount, txHash) => {
  const { account, ethersProvider, providerChainId } = useWeb3Context();
  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    if (fromToken && providerChainId === fromToken.chainId) {
      fetchAllowance(fromToken, account, ethersProvider).then(setAllowance);
    } else {
      setAllowance(BigNumber.from(0));
    }
  }, [ethersProvider, account, fromToken, providerChainId, txHash]);

  useEffect(() => {
    setAllowed(
      (fromToken && ['NATIVE', 'erc677'].includes(fromToken.mode)) ||
        allowance.gte(fromAmount),
    );
  }, [fromAmount, allowance, fromToken]);

  const [unlockLoading, setUnlockLoading] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState();

  const approve = useCallback(async () => {
    setUnlockLoading(true);
    const approvalAmount =
      window.localStorage.getItem(INFINITE_UNLOCK) === 'true'
        ? LARGEST_UINT256
        : fromAmount;
    try {
      const tx = await approveToken(ethersProvider, fromToken, approvalAmount);
      setApprovalTxHash(tx.hash);
      await tx.wait();
      setAllowance(approvalAmount);
    } catch (approveError) {
      logError({
        approveError,
        fromToken,
        approvalAmount: approvalAmount.toString(),
        account,
      });
      throw approveError;
    } finally {
      setApprovalTxHash();
      setUnlockLoading(false);
    }
  }, [fromAmount, fromToken, ethersProvider, account]);

  return { allowed, unlockLoading, approvalTxHash, approve };
};
