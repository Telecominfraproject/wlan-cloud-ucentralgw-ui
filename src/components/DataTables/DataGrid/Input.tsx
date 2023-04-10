import * as React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import {
  Tooltip,
  Flex,
  IconButton,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { Table } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { useContainerDimensions } from 'hooks/useContainerDimensions';

type Props<T extends object> = {
  table: Table<T>;
  isDisabled?: boolean;
};

const DataGridControls = <T extends object>({ table, isDisabled }: Props<T>) => {
  const { t } = useTranslation();
  const { ref, dimensions } = useContainerDimensions({ precision: 100 });
  const isCompact = dimensions.width !== 0 && dimensions.width <= 800;

  return (
    <Flex ref={ref} justifyContent="space-between" m={4} alignItems="center">
      <Flex>
        <Tooltip label={t('table.first_page')}>
          <IconButton
            aria-label="Go to first page"
            onClick={() => table.setPageIndex(0)}
            isDisabled={isDisabled || !table.getCanPreviousPage()}
            icon={<ArrowLeftIcon h={3} w={3} />}
            mr={4}
          />
        </Tooltip>
        <Tooltip label={t('table.previous_page')}>
          <IconButton
            aria-label="Previous page"
            onClick={() => table.previousPage()}
            isDisabled={isDisabled || !table.getCanPreviousPage()}
            icon={<ChevronLeftIcon h={6} w={6} />}
          />
        </Tooltip>
      </Flex>

      <Flex alignItems="center">
        {isCompact ? null : (
          <>
            <Text flexShrink={0} mr={8}>
              {t('table.page')}{' '}
              <Text fontWeight="bold" as="span">
                {table.getState().pagination.pageIndex + 1}
              </Text>{' '}
              {t('common.of')}{' '}
              <Text fontWeight="bold" as="span">
                {table.getPageCount()}
              </Text>
            </Text>
            <Text flexShrink={0}>{t('table.go_to_page')}</Text>{' '}
            <NumberInput
              ml={2}
              mr={8}
              w={28}
              min={1}
              max={table.getPageCount()}
              onChange={(_, numberValue) => {
                const newPage = numberValue ? numberValue - 1 : 0;
                table.setPageIndex(newPage);
              }}
              value={table.getState().pagination.pageIndex + 1}
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
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
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
            onClick={() => table.nextPage()}
            isDisabled={isDisabled || !table.getCanNextPage()}
            icon={<ChevronRightIcon h={6} w={6} />}
          />
        </Tooltip>
        <Tooltip label={t('table.last_page')}>
          <IconButton
            aria-label="Go to last page"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            isDisabled={isDisabled || !table.getCanNextPage()}
            icon={<ArrowRightIcon h={3} w={3} />}
            ml={4}
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};

export default DataGridControls;
