import { useRefresh } from 'hooks/useRefresh';
import { POLLING_INTERVAL } from 'lib/constants';
import { useEffect } from 'react';

export const useUpdateInterval = () => {
  const [refreshCount, refresh] = useRefresh();

  useEffect(() => {
    const id = setInterval(refresh, POLLING_INTERVAL);
    return () => clearInterval(id);
  }, [refresh]);

  return [refreshCount, refresh];
};
