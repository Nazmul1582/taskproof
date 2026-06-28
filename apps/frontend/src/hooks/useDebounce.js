import { useState, useEffect } from "react";

const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  console.log("value & debouncedValue", value, debouncedValue);

  return debouncedValue;
};

export default useDebounce;
