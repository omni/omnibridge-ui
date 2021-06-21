import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import {
  combineRequestsWithExecutions,
  getExecutions,
  getRequests,
} from 'lib/history';
import { useEffect, useState } from 'react';

export const useUserHistory = () => {
  const { homeChainId, foreignChainId, getGraphEndpoint } =
    useBridgeDirection();
  const { account } = useWeb3Context();
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!account) return () => undefined;
    let isSubscribed = true;
    async function update() {
      setTransfers();
      setLoading(true);
      const [{ requests: homeRequests }, { requests: foreignRequests }] =
        await Promise.all([
          getRequests(account, getGraphEndpoint(homeChainId)),
          getRequests(account, getGraphEndpoint(foreignChainId)),
        ]);
      const [
        { executions: homeExecutions },
        { executions: foreignExecutions },
      ] = await Promise.all([
        getExecutions(getGraphEndpoint(homeChainId), foreignRequests),
        getExecutions(getGraphEndpoint(foreignChainId), homeRequests),
      ]);
      const homeTransfers = combineRequestsWithExecutions(
        homeRequests,
        foreignExecutions,
        homeChainId,
        foreignChainId,
      );
      const foreignTransfers = combineRequestsWithExecutions(
        foreignRequests,
        homeExecutions,
        foreignChainId,
        homeChainId,
      );
      const allTransfers = [...homeTransfers, ...foreignTransfers].sort(
        (a, b) => b.timestamp - a.timestamp,
      );
      if (isSubscribed) {
        setTransfers(allTransfers);
        setLoading(false);
      }
    }

    update();

    return () => {
      isSubscribed = false;
    };
  }, [homeChainId, foreignChainId, account, getGraphEndpoint]);

  return { transfers, loading };
};
