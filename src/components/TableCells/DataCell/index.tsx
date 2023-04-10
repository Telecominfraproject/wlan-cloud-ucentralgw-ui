import React, { useMemo } from 'react';
import { Box, BoxProps } from '@chakra-ui/react';
import { bytesString } from 'helpers/stringHelper';

type Props = { bytes?: number; showZerosAs?: string; boxProps?: BoxProps };
const DataCell = ({ bytes, showZerosAs, boxProps }: Props) => {
  const data = useMemo(() => {
    if (bytes === undefined) return '-';
    if (showZerosAs && bytes === 0) return showZerosAs;
    return bytesString(bytes);
  }, [bytes]);

  return <Box {...boxProps}>{data}</Box>;
};

export default React.memo(DataCell);
