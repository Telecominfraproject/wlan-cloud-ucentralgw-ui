import React, { useMemo } from 'react';

const NumberCell = ({ value }: { value?: number }) => {
  const data = useMemo(() => {
    if (value === undefined) return '-';

    return value.toLocaleString();
  }, [value]);

  return <div>{data}</div>;
};

export default React.memo(NumberCell);
