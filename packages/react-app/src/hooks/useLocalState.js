import { useCallback, useEffect, useMemo, useState } from 'react';

const useLocalState = (
  initialValue,
  key = 'omnibridge-key',
  { valueType = 'string', isLazilyStored = false } = {},
) => {
  const storageValue = window.localStorage.getItem(key);
  const castedValue = useMemo(() => {
    if (valueType === 'number') {
      return parseInt(storageValue, 10);
    }
    if (valueType === 'boolean') {
      return storageValue === 'true';
    }
    if (valueType === 'object') {
      return JSON.parse(storageValue);
    }
    return storageValue;
  }, [storageValue, valueType]);

  const [value, setValue] = useState(castedValue || initialValue);

  const updateValue = useCallback(
    (val, shouldBeCached = false) => {
      const result = typeof val === 'function' ? val(value) : val;
      JSON.stringify(result) !== JSON.stringify(value) && setValue(result);
      (!!isLazilyStored || !!shouldBeCached) &&
        window.localStorage.setItem(key, result);
    },
    [key, value, isLazilyStored],
  );

  useEffect(() => {
    updateValue(value);
  }, [key, value, updateValue]);

  useEffect(() => {
    !storageValue && localStorage.setItem(key, initialValue);
  }, [key, initialValue, storageValue]);

  return [value, updateValue, castedValue];
};

export { useLocalState };
