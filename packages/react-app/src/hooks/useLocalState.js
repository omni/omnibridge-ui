import { useCallback, useEffect, useState } from 'react';

const useLocalState = (initialValue, key = 'omnibridge-key') => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialValue);

  const updateValue = useCallback(
    val => {
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
