import { useCallback, useEffect, useState } from 'react';

const useLocalState = (
  initialValue,
  key = 'omnibridge-key',
  valueType = 'string',
) => {
  const storageValue = localStorage.getItem(key);
  let castedValue = storageValue;

  if (valueType === 'number') {
    castedValue = parseInt(storageValue, 10);
  } else if (valueType === 'boolean') {
    castedValue = Boolean(storageValue);
  } else if (valueType === 'object') {
    castedValue = JSON.parse(storageValue);
  }

  const [value, setValue] = useState(castedValue || initialValue);

  const updateValue = useCallback(
    val => {
      console.log(val, typeof val);
      const result = typeof val === 'function' ? val(value) : val;
      localStorage.setItem(key, result);
      setValue(result);
    },
    [key, value],
  );

  useEffect(() => {
    updateValue(value);
  }, [value, updateValue]);

  return [value, updateValue];
};

export { useLocalState };
