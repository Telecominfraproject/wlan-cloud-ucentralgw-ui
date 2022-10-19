import { bytesString } from 'helpers/stringHelper';
import React, { useMemo } from 'react';

const DataCell: React.FC<{ bytes?: number }> = ({ bytes }) => {
  const data = useMemo(() => {
    if (bytes === undefined) return '-';

    return bytesString(bytes);
  }, [bytes]);

  return <div>{data}</div>;
};

export default React.memo(DataCell);
