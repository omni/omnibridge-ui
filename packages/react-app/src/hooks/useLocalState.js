import { useCallback, useEffect, useState } from 'react';

const useLocalState = (initialValue, key) => {
  const [value, setValue] = useState(initialValue);

  const updateValue = useCallback(
    val => {
      localStorage.setItem(key, val);
      setValue(val);
    },
    [key],
  );

  useEffect(() => {
    updateValue(value);
  }, [value, updateValue]);

  return [value, updateValue];
};

export { useLocalState };
