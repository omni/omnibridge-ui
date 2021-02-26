import { Web3Context } from 'contexts/Web3Context';
import { HOME_NETWORK } from 'lib/constants';
import { getBridgeNetwork } from 'lib/helpers';
import {
  combineRequestsWithExecutions,
  getExecutions,
  getRequests,
} from 'lib/history';
import { useContext, useEffect, useState } from 'react';
import { defer } from 'rxjs';

export const useUserHistory = () => {
  const { account } = useContext(Web3Context);
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(true);
  const chainId = HOME_NETWORK;

  useEffect(() => {
    if (!account || !chainId) return () => undefined;
    const bridgeChainId = getBridgeNetwork(chainId);
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
