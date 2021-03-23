import { BridgeContext } from 'contexts/BridgeContext';
import { useWeb3Context } from 'contexts/Web3Context';
import { useBridgeDirection } from 'hooks/useBridgeDirection';
import {
  combineRequestsWithExecutions,
  getExecutions,
  getRequests,
} from 'lib/history';
import { useContext, useEffect, useState } from 'react';
import { defer } from 'rxjs';

export const useClaimableTransfers = () => {
  const {
    homeChainId,
    foreignChainId,
    getGraphEndpoint,
  } = useBridgeDirection();
  const { account } = useWeb3Context();
  const { txHash } = useContext(BridgeContext);
  const [transfers, setTransfers] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!account) return () => undefined;
    async function update() {
      setLoading(true);
      setTransfers();
      const { requests } = await getRequests(
        account,
        getGraphEndpoint(homeChainId),
      );
      const { executions } = await getExecutions(
        getGraphEndpoint(foreignChainId),
        requests,
      );
      const xDaiTransfers = combineRequestsWithExecutions(
        requests,
        executions,
        homeChainId,
        foreignChainId,
      )
        .sort((a, b) => b.timestamp - a.timestamp)
        .filter(t => !t.receivingTx);
      setTransfers(xDaiTransfers);
      setLoading(false);
    }
    const subscription = defer(() => update()).subscribe();
    return () => subscription.unsubscribe();
  }, [account, txHash, homeChainId, foreignChainId, getGraphEndpoint]);

  return { transfers, loading };
};
