import { useCallback, useEffect, useMemo, useState } from 'react';

export const useLocalState = (
  initialValue,
  key,
  { valueType = 'string', isStoredImmediately = false } = {},
) => {
  const storageValue = useMemo(() => window.localStorage.getItem(key), [key]);
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

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (key && castedValue) {
      setValue(castedValue);
    }
  }, [key, castedValue]);

  const updateValue = useCallback(
    (val, shouldBeStored = false) => {
      const result = typeof val === 'function' ? val(value) : val;
      JSON.stringify(result) !== JSON.stringify(value) && setValue(result);
      (!!isStoredImmediately || !!shouldBeStored) &&
        !!key &&
        window.localStorage.setItem(key, result);
    },
    [key, value, isStoredImmediately],
  );

  useEffect(() => {
    updateValue(value);
  }, [key, value, updateValue]);

  useEffect(() => {
    !!key && !storageValue && localStorage.setItem(key, initialValue);
  }, [key, initialValue, storageValue]);

  return [value, updateValue, castedValue];
};
