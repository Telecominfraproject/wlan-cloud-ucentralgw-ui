import React, { useEffect, useState } from 'react';
import { ArrowRightIcon, ArrowLeftIcon, ChevronRightIcon, ChevronLeftIcon } from '@chakra-ui/icons';
import {
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
  Flex,
  IconButton,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  Box,
  Center,
  Spinner,
  Heading,
  useBreakpoint,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import {
  useTable,
  usePagination,
  useSortBy,
  Row,
  UsePaginationInstanceProps,
  UseSortByInstanceProps,
  UsePaginationState,
  TableInstance,
} from 'react-table';
import { v4 as uuid } from 'uuid';
import { LoadingOverlay } from 'components/LoadingOverlay';
import SortIcon from './SortIcon';
import { Column, PageInfo } from 'models/Table';

const defaultProps = {
  sortBy: [],
};

export type DataTableProps = {
  columns: readonly Column<object>[];
  data: object[];
  count?: number;
  setPageInfo?: React.Dispatch<React.SetStateAction<PageInfo | undefined>>;
  isLoading?: boolean;
  obj?: string;
  sortBy?: { id: string; desc: boolean }[];
  hiddenColumns?: string[];
  hideControls?: boolean;
  minHeight?: string | number;
  fullScreen?: boolean;
  isManual?: boolean;
  saveSettingsId?: string;
  showAllRows?: boolean;
};

type TableInstanceWithHooks<T extends object> = TableInstance<T> &
  UsePaginationInstanceProps<T> &
  UseSortByInstanceProps<T> & {
    state: UsePaginationState<T>;
  };

const _DataTable = ({
  columns,
  data,
  isLoading,
  obj,
  minHeight,
  fullScreen,
  sortBy,
  hiddenColumns,
  hideControls,
  count,
  setPageInfo,
  isManual,
  saveSettingsId,
  showAllRows,
}: DataTableProps) => {
  const { t } = useTranslation();
  const breakpoint = useBreakpoint();
  const textColor = useColorModeValue('gray.700', 'white');
  const getPageSize = () => {
    try {
      if (showAllRows) return 1000000;
      const saved = saveSettingsId ? localStorage.getItem(saveSettingsId) : undefined;
      if (saved) return Number.parseInt(saved, 10);
      return 10;
    } catch {
      return 10;
    }
  };
  const getPageIndex = () => {
    try {
      if (saveSettingsId) {
        const saved = localStorage.getItem(`${saveSettingsId}.page`);
        if (saved) return Number.parseInt(saved, 10);
      }
      return 0;
    } catch {
      return 0;
    }
  };
  const [queryPageSize, setQueryPageSize] = useState(getPageSize());

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    setHiddenColumns,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      // @ts-ignore
      columns,
      data,
      // @ts-ignore
      initialState: { sortBy, pagination: !hideControls, pageSize: queryPageSize },
      manualPagination: isManual,
      pageCount:
        isManual && count !== undefined
          ? Math.ceil(count / queryPageSize)
          : Math.ceil(data?.length ?? 0 / queryPageSize),
    },
    useSortBy,
    usePagination,
  ) as TableInstanceWithHooks<object>;

  const handleNextPage = () => {
    nextPage();
    if (saveSettingsId) localStorage.setItem(`${saveSettingsId}.page`, String(pageIndex + 1));
  };
  const handlePreviousPage = () => {
    previousPage();
    if (saveSettingsId) localStorage.setItem(`${saveSettingsId}.page`, String(pageIndex - 1));
  };

  useEffect(() => {
    if (setPageInfo && pageIndex !== undefined) setPageInfo({ index: pageIndex, limit: queryPageSize });
  }, [queryPageSize, pageIndex]);

  useEffect(() => {
    // @ts-ignore
    if (saveSettingsId) localStorage.setItem(saveSettingsId, pageSize);
    setQueryPageSize(pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (isManual && count !== undefined) {
      gotoPage(getPageIndex());
    }
  }, [count]);
  useEffect(() => {
    if (hiddenColumns) setHiddenColumns(hiddenColumns);
  }, [hiddenColumns]);

  // If this is a manual DataTable, with a page index that is higher than 0 and higher than the max possible page, we send to index 0
  useEffect(() => {
    if (
      isManual &&
      setPageInfo &&
      data &&
      isManual &&
      pageIndex > 0 &&
      count !== undefined &&
      Math.ceil(count / queryPageSize) - 1 < pageIndex
    ) {
      gotoPage(0);
      setPageInfo({ index: 0, limit: queryPageSize });
    }
  }, [count, queryPageSize, page, data]);

  const computedMinHeight = () => {
    if (fullScreen) return { base: 'calc(100vh - 360px)', md: 'calc(100vh - 288px)' };
    return minHeight;
  };

  if (isLoading && data.length === 0) {
    return (
      <Center>
        <Spinner size="xl" />
      </Center>
    );
  }

  // Render the UI for your table
  return (
    <>
      <Box minHeight={computedMinHeight()} position="relative">
        <LoadingOverlay isLoading={isManual !== undefined && isManual && isLoading !== undefined && isLoading}>
          <Table {...getTableProps()} size="small" textColor={textColor} w="100%">
            <Thead fontSize="14px">
              {
                // @ts-ignore
                headerGroups.map((group) => (
                  <Tr {...group.getHeaderGroupProps()} key={uuid()}>
                    {
                      // @ts-ignore
                      group.headers.map((column) => (
                        <Th
                          color="gray.400"
                          {...column.getHeaderProps()}
                          // @ts-ignore
                          minWidth={column.customMinWidth ?? null}
                          // @ts-ignore
                          maxWidth={column.customMaxWidth ?? null}
                          // @ts-ignore
                          width={column.customWidth ?? null}
                        >
                          <div
                            // @ts-ignore
                            {...column.getSortByToggleProps()}
                            style={{
                              alignContent: 'center',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              // @ts-ignore
                              paddingTop: column.canSort ? '' : '4px',
                            }}
                          >
                            {column.render('Header')}
                            <SortIcon
                              // @ts-ignore
                              isSorted={column.isSorted}
                              // @ts-ignore
                              isSortedDesc={column.isSortedDesc}
                              // @ts-ignore
                              canSort={column.canSort}
                            />
                          </div>
                        </Th>
                      ))
                    }
                  </Tr>
                ))
              }
            </Thead>
            {data.length > 0 && (
              <Tbody {...getTableBodyProps()}>
                {page.map((row: Row) => {
                  prepareRow(row);
                  return (
                    <Tr {...row.getRowProps()} key={uuid()}>
                      {
                        // @ts-ignore
                        row.cells.map((cell) => (
                          <Td
                            key={uuid()}
                            px={1}
                            // @ts-ignore
                            minWidth={cell.column.customMinWidth ?? undefined}
                            // @ts-ignore
                            maxWidth={cell.column.customMaxWidth ?? undefined}
                            // @ts-ignore
                            width={cell.column.customWidth ?? undefined}
                            textOverflow="ellipsis"
                            overflow="hidden"
                            whiteSpace="nowrap"
                            fontSize="14px"
                            // @ts-ignore
                            textAlign={cell.column.isCentered ? 'center' : undefined}
                            // @ts-ignore
                            fontFamily={cell.column.isMonospace ? 'monospace' : undefined}
                          >
                            {cell.render('Cell')}
                          </Td>
                        ))
                      }
                    </Tr>
                  );
                })}
              </Tbody>
            )}
          </Table>
          {!isLoading && data.length === 0 && (
            <Center>
              {obj ? (
                <Heading size="md" pt={12}>
                  {t('common.no_obj_found', { obj })}
                </Heading>
              ) : (
                <Heading size="sm" pt={12}>
                  {t('common.empty_list')}
                </Heading>
              )}
            </Center>
          )}
        </LoadingOverlay>
      </Box>
      {!hideControls && (
        <Flex justifyContent="space-between" m={4} alignItems="center">
          <Flex>
            <Tooltip label={t('table.first_page')}>
              <IconButton
                aria-label="Go to first page"
                onClick={() => gotoPage(0)}
                isDisabled={!canPreviousPage}
                icon={<ArrowLeftIcon h={3} w={3} />}
                mr={4}
              />
            </Tooltip>
            <Tooltip label={t('table.previous_page')}>
              <IconButton
                aria-label="Previous page"
                onClick={handlePreviousPage}
                isDisabled={!canPreviousPage}
                icon={<ChevronLeftIcon h={6} w={6} />}
              />
            </Tooltip>
          </Flex>

          <Flex alignItems="center">
            {breakpoint !== 'base' && (
              <>
                <Text flexShrink={0} mr={8}>
                  {t('table.page')}{' '}
                  <Text fontWeight="bold" as="span">
                    {pageIndex + 1}
                  </Text>{' '}
                  {t('common.of')}{' '}
                  <Text fontWeight="bold" as="span">
                    {pageOptions.length}
                  </Text>
                </Text>
                <Text flexShrink={0}>{t('table.go_to_page')}</Text>{' '}
                <NumberInput
                  ml={2}
                  mr={8}
                  w={28}
                  min={1}
                  max={pageOptions.length}
                  onChange={(_: unknown, numberValue: number) => {
                    const newPage = numberValue ? numberValue - 1 : 0;
                    gotoPage(newPage);
                  }}
                  defaultValue={pageIndex + 1}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </>
            )}
            <Select
              w={32}
              value={pageSize}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                setPageSize(Number(e.target.value));
              }}
            >
              {[10, 20, 30, 40, 50].map((opt) => (
                <option key={uuid()} value={opt}>
                  {t('common.show')} {opt}
                </option>
              ))}
            </Select>
          </Flex>

          <Flex>
            <Tooltip label={t('table.next_page')}>
              <IconButton
                aria-label="Go to next page"
                onClick={handleNextPage}
                isDisabled={!canNextPage}
                icon={<ChevronRightIcon h={6} w={6} />}
              />
            </Tooltip>
            <Tooltip label={t('table.last_page')}>
              <IconButton
                aria-label="Go to last page"
                onClick={() => gotoPage(pageCount - 1)}
                isDisabled={!canNextPage}
                icon={<ArrowRightIcon h={3} w={3} />}
                ml={4}
              />
            </Tooltip>
          </Flex>
        </Flex>
      )}
    </>
  );
};

_DataTable.defaultProps = defaultProps;

export const DataTable = React.memo(_DataTable);
