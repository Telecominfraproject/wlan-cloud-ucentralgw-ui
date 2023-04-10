import React from 'react';
import { Box, BoxProps } from '@chakra-ui/react';

type Props = {
  value?: number;
  boxProps?: BoxProps;
  showZerosAs?: string;
};

const NumberCell = ({ value, boxProps, showZerosAs }: Props) => {
  const getData = () => {
    if (value === undefined) return '-';
    if (value === 0 && showZerosAs) return showZerosAs;
    return value.toLocaleString();
  };

  return <Box {...boxProps}>{getData()}</Box>;
};

export default React.memo(NumberCell);
