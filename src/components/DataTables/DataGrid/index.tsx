import React from 'react';
import {
  Box,
  Center,
  Flex,
  HStack,
  Heading,
  LayoutProps,
  Spacer,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Thead,
  useColorModeValue,
} from '@chakra-ui/react';
import { getCoreRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { RefreshButton } from '../../Buttons/RefreshButton';
import { DataGridCellRow } from './CellRow';
import { DataGridHeaderRow } from './HeaderRow';
import DataGridControls from './Input';
import TableSettingsModal from './TableSettingsModal';
import { DataGridColumn, UseDataGridReturn } from './useDataGrid';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { LoadingOverlay } from 'components/LoadingOverlay';

export type ColumnOptions = {
  isSortable?: boolean;
};

export type DataGridOptions<TValue extends object> = {
  count?: number;
  isFullScreen?: boolean;
  isHidingControls?: boolean;
  isManual?: boolean;
  minimumHeight?: LayoutProps['minH'];
  onRowClick?: (row: TValue) => (() => void) | undefined;
  refetch?: () => void;
  showAsCard?: boolean;
  hideTablePreferences?: boolean;
  hideTableTitleRow?: boolean;
};

export type DataGridProps<TValue extends object> = {
  innerTableKey?: string | number;
  controller: UseDataGridReturn;
  columns: DataGridColumn<TValue>[];
  header: {
    title: string | React.ReactNode;
    objectListed: string;
    leftContent?: React.ReactNode;
    addButton?: React.ReactNode;
    otherButtons?: React.ReactNode;
  };
  data?: TValue[];
  isLoading?: boolean;
  options?: DataGridOptions<TValue>;
};

export const DataGrid = <TValue extends object>({
  innerTableKey,
  controller,
  columns,
  header,
  data = [],
  options = {},
  isLoading = false,
}: DataGridProps<TValue>) => {
  const { t } = useTranslation();

  /*
    Table Styling
  */
  const textColor = useColorModeValue('gray.700', 'white');
  const hoveredRowBg = useColorModeValue('gray.100', 'gray.600');

  const minimumHeight: LayoutProps['minH'] = React.useMemo(() => {
    if (options.isFullScreen) {
      return { base: 'calc(100vh - 360px)', md: 'calc(100vh - 288px)' };
    }
    return options.minimumHeight ?? '300px';
  }, [options.isFullScreen, options.minimumHeight]);

  /*
    Table Options
  */
  const onRowClick = React.useMemo(() => options.onRowClick, [options.onRowClick]);

  const pagination = React.useMemo(
    () => ({
      pageIndex: controller.pageInfo.pageIndex,
      pageSize: controller.pageInfo.pageSize,
    }),
    [controller.pageInfo.pageIndex, controller.pageInfo.pageSize],
  );

  const pageCount = React.useMemo(() => {
    if (options.isManual && options.count) {
      return Math.ceil(options.count / pagination.pageSize);
    }
    return Math.ceil((data?.length ?? 0) / pagination.pageSize);
  }, [options.count, options.isManual, data?.length, pagination.pageSize]);

  const tableOptions = React.useMemo(
    () => ({
      pageCount: pageCount > 0 ? pageCount : 1,
      initialState: { sorting: controller.sortBy, pagination },
      manualPagination: options.isManual,
      manualSorting: options.isManual,
      autoResetPageIndex: false,
    }),
    [options.isManual, controller.sortBy, pageCount],
  );

  const orderedColumns = React.useMemo(() => {
    const order = controller.columnOrder.filter((id) => columns.find((col) => col.id === id));
    if (order.length !== columns.length) {
      for (const col of columns) {
        if (!order.includes(col.id)) {
          order.push(col.id);
        }
      }
    }

    return columns.slice().sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [columns, controller.columnOrder]);

  const table = useReactTable<TValue>({
    // react-table base functions
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),

    // Table State
    data,
    columns: orderedColumns,
    state: {
      sorting: controller.sortBy,
      columnVisibility: controller.columnVisibility,
      pagination,
    },

    // Change Handlers
    onSortingChange: controller.setSortBy,
    onPaginationChange: controller.onPaginationChange,

    // debugTable: true,

    // Table Options
    ...tableOptions,
  });

  // If this is a manual DataTable, with a page index that is higher than 0 and higher than the max possible page, we send to index 0
  React.useEffect(() => {
    if (
      options.isManual &&
      !isLoading &&
      data &&
      pagination.pageIndex > 0 &&
      options.count !== undefined &&
      Math.ceil(options.count / pagination.pageSize) - 1 < pagination.pageIndex
    ) {
      controller.onPaginationChange({ pageIndex: 0, pageSize: pagination.pageSize });
    }
  }, [options.count, isLoading, pagination, data]);

  if (isLoading && !options.showAsCard && data.length === 0) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  return options.showAsCard ? (
    <Card>
      <CardHeader>
        {typeof header.title === 'string' ? (
          <Heading size="md" my="auto" mr={2}>
            {header.title}
          </Heading>
        ) : (
          header.title
        )}
        {header.leftContent}
        <Spacer />
        <HStack spacing={2}>
          {header.otherButtons}
          {header.addButton}
          {options.hideTablePreferences ? null : (
            // @ts-ignore
            <TableSettingsModal<TValue> controller={controller} columns={columns} />
          )}
          {options.refetch ? <RefreshButton onClick={options.refetch} isCompact isFetching={isLoading} /> : null}
        </HStack>
      </CardHeader>
      <CardBody display="flex" flexDirection="column">
        <LoadingOverlay isLoading={isLoading}>
          <TableContainer minH={minimumHeight}>
            <Table size="small" variant="simple" textColor={textColor} w="100%" fontSize="14px" key={innerTableKey}>
              <Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <DataGridHeaderRow<TValue> key={headerGroup.id} headerGroup={headerGroup} />
                ))}
              </Thead>
              <Tbody>
                {table.getRowModel().rows.map((row) => (
                  <DataGridCellRow<TValue> key={row.id} row={row} onRowClick={onRowClick} rowStyle={{ hoveredRowBg }} />
                ))}
              </Tbody>
            </Table>
            {data?.length === 0 ? (
              <Center mt={8}>
                <Heading size="md">
                  {header.objectListed
                    ? t('common.no_obj_found', { obj: header.objectListed })
                    : t('common.empty_list')}
                </Heading>
              </Center>
            ) : null}
          </TableContainer>
        </LoadingOverlay>
        {!options.isHidingControls ? <DataGridControls table={table} isDisabled={isLoading} /> : null}
      </CardBody>
    </Card>
  ) : (
    <Box w="100%">
      <Flex mb={2} hidden={options.hideTableTitleRow}>
        <Heading size="md" my="auto" mr={2}>
          {header.title}
        </Heading>
        {header.leftContent}
        <Spacer />
        <HStack spacing={2}>
          {header.otherButtons}
          {header.addButton}
          {options.hideTablePreferences ? null : (
            // @ts-ignore
            <TableSettingsModal<TValue> controller={controller} columns={columns} />
          )}
          {options.refetch ? <RefreshButton onClick={options.refetch} isCompact isFetching={isLoading} /> : null}
        </HStack>
      </Flex>
      <LoadingOverlay isLoading={isLoading}>
        <TableContainer minH={minimumHeight}>
          <Table size="small" variant="simple" textColor={textColor} w="100%" fontSize="14px" key={innerTableKey}>
            <Thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <DataGridHeaderRow<TValue> key={headerGroup.id} headerGroup={headerGroup} />
              ))}
            </Thead>
            <Tbody>
              {table.getRowModel().rows.map((row) => (
                <DataGridCellRow<TValue> key={row.id} row={row} onRowClick={onRowClick} rowStyle={{ hoveredRowBg }} />
              ))}
            </Tbody>
          </Table>
          {data?.length === 0 ? (
            <Center mt={8}>
              <Heading size="md">
                {header.objectListed ? t('common.no_obj_found', { obj: header.objectListed }) : t('common.empty_list')}
              </Heading>
            </Center>
          ) : null}
        </TableContainer>
      </LoadingOverlay>
      {!options.isHidingControls ? <DataGridControls table={table} isDisabled={isLoading} /> : null}
    </Box>
  );
};
