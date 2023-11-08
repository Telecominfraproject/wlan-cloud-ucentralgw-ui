/* eslint-disable @typescript-eslint/no-unused-vars */
import { BoxProps } from '@chakra-ui/react';
import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    ref?: React.MutableRefObject<HTMLTableCellElement | null>;
    customMinWidth?: string;
    anchored?: boolean;
    stopPropagation?: boolean;
    alwaysShow?: boolean;
    hasPopover?: boolean;
    customMaxWidth?: string;
    customWidth?: string;
    isMonospace?: boolean;
    isCentered?: boolean;
    columnSelectorOptions?: {
      label?: string;
    };
    rowContentOptions?: {
      style?: React.CSSProperties;
    };
    headerOptions?: {
      tooltip?: string;
    };
    headerStyleProps?: BoxProps;
  }
}
