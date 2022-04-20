import { useCallback, useState } from 'react';

export const useRefresh = () => {
  const [refreshCount, setRefreshCount] = useState(0);
  const refresh = useCallback(() => setRefreshCount(c => c + 1), []);
  return [refreshCount, refresh];
};
