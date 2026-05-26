import { useCallback, useEffect, useState } from "react";

export const useDebounce = (fn, delay) => {
  let timer;
  return useCallback(
    (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    },
    [fn, delay, timer],
  );
};


export const useDebounceValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
};