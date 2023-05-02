import React from 'react';
import { Box, Checkbox, IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react';
import { FunnelSimple } from '@phosphor-icons/react';
import { VisibilityState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DataGridColumn } from './useDataGrid';

export type DataGridColumnPickerProps<TValue extends object> = {
  columns: DataGridColumn<TValue>[];
  columnVisibility: VisibilityState;
  toggleVisibility: (id: string) => void;
};

export const DataGridColumnPicker = <TValue extends object>({
  columns,
  columnVisibility,
  toggleVisibility,
}: DataGridColumnPickerProps<TValue>) => {
  const { t } = useTranslation();

  return (
    <Box>
      <Menu closeOnSelect={false} isLazy>
        <Tooltip label={t('common.columns')} hasArrow>
          <MenuButton as={IconButton} icon={<FunnelSimple />} />
        </Tooltip>
        <MenuList maxH="200px" overflowY="auto">
          {columns
            .filter((col) => col.id && col.header)
            .map((column) => {
              const handleClick =
                column.id !== undefined ? () => toggleVisibility(column.id as unknown as string) : undefined;
              const id = column.id ?? uuid();
              let label = column.header?.toString() ?? 'Unrecognized column';
              if (column.meta?.columnSelectorOptions?.label) label = column.meta.columnSelectorOptions.label;

              return (
                <MenuItem
                  key={id}
                  as={Checkbox}
                  isChecked={columnVisibility[id] === undefined || columnVisibility[id]}
                  onChange={column.meta?.alwaysShow ? undefined : handleClick}
                  isDisabled={column.meta?.alwaysShow}
                >
                  {label}
                </MenuItem>
              );
            })}
        </MenuList>
      </Menu>
    </Box>
  );
};
