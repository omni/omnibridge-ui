import { useUpdateInterval } from 'hooks/useUpdateInterval';
import { useMemo } from 'react';
import { getETHPrice } from 'stores/ethPrice';

export const useETHPrice = () => {
  const [refreshCount] = useUpdateInterval();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getETHPrice(), [refreshCount]);
};
