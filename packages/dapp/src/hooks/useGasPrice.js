import { useUpdateInterval } from 'hooks/useUpdateInterval';
import { useMemo } from 'react';
import {
  getGasPrice,
  getLowestHistoricalEthGasPrice,
  getMedianHistoricalEthGasPrice,
} from 'stores/gasPrice';

export const useGasPrice = () => {
  const [refreshCount] = useUpdateInterval();

  return useMemo(
    () => ({
      gasPrice: getGasPrice(),
      lowestPrice: getLowestHistoricalEthGasPrice(),
      medianPrice: getMedianHistoricalEthGasPrice(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshCount],
  );
};
