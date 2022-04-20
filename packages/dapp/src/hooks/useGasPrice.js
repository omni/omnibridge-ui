import { useUpdateInterval } from 'hooks/useUpdateInterval';
import { useMemo } from 'react';
import {
  getCurrentEthGasPrice,
  getHighestHistoricalEthGasPrice,
  getLowestHistoricalEthGasPrice,
  getMedianHistoricalEthGasPrice,
} from 'stores/gasPrice';

export const useGasPrice = () => {
  const [refreshCount] = useUpdateInterval();

  return useMemo(
    () => ({
      currentPrice: getCurrentEthGasPrice(),
      lowestPrice: getLowestHistoricalEthGasPrice(),
      medianPrice: getMedianHistoricalEthGasPrice(),
      highestPrice: getHighestHistoricalEthGasPrice(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshCount],
  );
};
