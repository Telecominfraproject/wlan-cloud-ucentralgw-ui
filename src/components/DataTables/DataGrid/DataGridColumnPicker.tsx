import React from 'react';
import { Box, Checkbox, IconButton, Menu, MenuButton, MenuItem, MenuList, Tooltip } from '@chakra-ui/react';
import { VisibilityState } from '@tanstack/react-table';
import { FunnelSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DataGridColumn } from './useDataGrid';
import { useAuth } from 'contexts/AuthProvider';

export type DataGridColumnPickerProps<TValue extends object> = {
  preference: string;
  columns: DataGridColumn<TValue>[];
  columnVisibility: VisibilityState;
  setColumnVisibility: (str: VisibilityState) => void;
};

export const DataGridColumnPicker = <TValue extends object>({
  preference,
  columns,
  columnVisibility,
  setColumnVisibility,
}: DataGridColumnPickerProps<TValue>) => {
  const { t } = useTranslation();
  const { getPref, setPref } = useAuth();

  const handleColumnClick = React.useCallback(
    (id: string) => {
      const newVisibility = { ...columnVisibility };
      newVisibility[id] = newVisibility[id] !== undefined ? !newVisibility[id] : false;
      const hiddenColumnsArray = Object.entries(newVisibility)
        .filter(([, value]) => !value)
        .map(([key]) => key);
      setPref({ preference, value: hiddenColumnsArray.join(',') });
      setColumnVisibility({ ...newVisibility });
    },
    [columnVisibility],
  );

  React.useEffect(() => {
    const savedPrefs = getPref(preference);

    if (savedPrefs) {
      const savedHiddenColumns = savedPrefs.split(',');
      setColumnVisibility(savedHiddenColumns.reduce((acc, curr) => ({ ...acc, [curr]: false }), {}));
    } else {
      setColumnVisibility({});
    }
  }, [preference]);

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
                column.id !== undefined ? () => handleColumnClick(column.id as unknown as string) : undefined;
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
