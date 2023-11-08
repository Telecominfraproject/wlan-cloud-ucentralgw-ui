import * as React from 'react';
import { Td, Tr } from '@chakra-ui/react';
import { Row, flexRender } from '@tanstack/react-table';

export type DataGridCellRowProps<TValue extends object> = {
  row: Row<TValue>;
  onRowClick: ((row: TValue) => (() => void) | undefined) | undefined;
  rowStyle: {
    hoveredRowBg: string;
  };
};

export const DataGridCellRow = <TValue extends object>({
  row,
  rowStyle: { hoveredRowBg },
  onRowClick,
}: DataGridCellRowProps<TValue>) => {
  const onClick = onRowClick ? onRowClick(row.original) : undefined;

  return (
    <Tr
      key={row.id}
      _hover={{
        backgroundColor: hoveredRowBg,
      }}
      onClick={onClick}
    >
      {row.getVisibleCells().map((cell) => (
        <Td
          px={1}
          key={cell.id}
          textOverflow="ellipsis"
          overflow="hidden"
          whiteSpace="nowrap"
          minWidth={cell.column.columnDef.meta?.customMinWidth ?? undefined}
          maxWidth={cell.column.columnDef.meta?.customMaxWidth ?? undefined}
          width={cell.column.columnDef.meta?.customWidth}
          textAlign={cell.column.columnDef.meta?.isCentered ? 'center' : undefined}
          fontFamily={
            cell.column.columnDef.meta?.isMonospace
              ? 'Inter, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              : undefined
          }
          onClick={
            cell.column.columnDef.meta?.stopPropagation || (cell.column.id === 'actions' && onClick)
              ? (e) => {
                  e.stopPropagation();
                }
              : undefined
          }
          cursor={
            !cell.column.columnDef.meta?.stopPropagation && cell.column.id !== 'actions' && onClick
              ? 'pointer'
              : undefined
          }
          border="0.5px solid gray"
          style={cell.column.columnDef.meta?.rowContentOptions?.style}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Td>
      ))}
    </Tr>
  );
};
