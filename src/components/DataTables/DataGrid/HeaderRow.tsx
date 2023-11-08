import * as React from 'react';
import { Box, Flex, Th, Tooltip, Tr } from '@chakra-ui/react';
import { HeaderGroup, flexRender } from '@tanstack/react-table';
import { DataGridSortIcon } from './SortIcon';

export type DataGridHeaderRowProps<TValue extends object> = {
  headerGroup: HeaderGroup<TValue>;
};

export const DataGridHeaderRow = <TValue extends object>({ headerGroup }: DataGridHeaderRowProps<TValue>) => (
  <Tr p={0}>
    {headerGroup.headers.map((header) => (
      <Th
        color="gray.400"
        key={header.id}
        colSpan={header.colSpan}
        minWidth={header.column.columnDef.meta?.customMinWidth ?? undefined}
        maxWidth={header.column.columnDef.meta?.customMaxWidth ?? undefined}
        width={header.column.columnDef.meta?.customWidth}
        fontSize="sm"
        onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
        cursor={header.column.getCanSort() ? 'pointer' : undefined}
        border="0.5px solid gray"
        px={1}
      >
        <Flex display="flex" alignItems="center">
          {header.isPlaceholder ? null : (
            <Tooltip label={header.column.columnDef.meta?.headerOptions?.tooltip}>
              <Box
                overflow="hidden"
                whiteSpace="nowrap"
                alignContent="center"
                width="100%"
                {...header.column.columnDef.meta?.headerStyleProps}
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </Box>
            </Tooltip>
          )}
          <DataGridSortIcon sortInfo={header.column.getIsSorted()} canSort={header.column.getCanSort()} />
        </Flex>
      </Th>
    ))}
  </Tr>
);
