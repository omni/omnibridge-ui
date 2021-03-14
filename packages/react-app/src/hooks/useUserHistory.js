import { useWeb3Context } from 'contexts/Web3Context';
import { FOREIGN_CHAIN_ID, HOME_CHAIN_ID } from 'lib/constants';
import {
  combineRequestsWithExecutions,
  getExecutions,
  getRequests,
} from 'lib/history';
import { useEffect, useState } from 'react';
import { defer } from 'rxjs';

export const useUserHistory = () => {
  const { account } = useWeb3Context();
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(true);
  const chainId = HOME_CHAIN_ID;

  useEffect(() => {
    if (!account || !chainId) return () => undefined;
    const bridgeChainId = FOREIGN_CHAIN_ID;
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
    const subscription = defer(() => update()).subscribe();
    return () => subscription.unsubscribe();
  }, [chainId, account]);

  return { transfers, loading };
};
