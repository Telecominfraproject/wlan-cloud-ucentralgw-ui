/* eslint-disable @typescript-eslint/no-unused-vars */
import { BoxProps } from '@chakra-ui/react';
import '@tanstack/react-table';

declare module '@tanstack/table-core' {
  interface ColumnMeta<TData extends RowData, TValue> {
    stopPropagation?: boolean;
    alwaysShow?: boolean;
    hasPopover?: boolean;
    customMaxWidth?: string;
    customMinWidth?: string;
    customWidth?: string;
    isMonospace?: boolean;
    isCentered?: boolean;
    columnSelectorOptions?: {
      label?: string;
    };
    headerOptions?: {
      tooltip?: string;
    };
    headerStyleProps?: BoxProps;
  }
}
