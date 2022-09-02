import { useState } from 'react';

const useToggle = (initialState) => {
  const [value, setValue] = useState(initialState);

  return [
    value,
    () => {
      setValue(!value);
    },
    (newValue) => {
      setValue(newValue);
    },
  ];
};

export default useToggle;
