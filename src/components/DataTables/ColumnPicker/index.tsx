import React, { useEffect } from 'react';
import { Button, Checkbox, IconButton, Menu, MenuButton, MenuItem, MenuList, useBreakpoint } from '@chakra-ui/react';
import { FunnelSimple } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { useAuth } from 'contexts/AuthProvider';
import { Column } from 'models/Table';

export type ColumnPickerProps = {
  preference: string;
  columns: Column<unknown>[];
  hiddenColumns: string[];
  setHiddenColumns: (str: string[]) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
};

export const ColumnPicker = ({ preference, columns, hiddenColumns, setHiddenColumns, size }: ColumnPickerProps) => {
  const { t } = useTranslation();
  const { getPref, setPref } = useAuth();
  const breakpoint = useBreakpoint();

  const handleColumnClick = (id: string) => {
    let newHidden = [];
    if (hiddenColumns.find((hidden) => hidden === id)) newHidden = [...hiddenColumns.filter((hidden) => hidden !== id)];
    else newHidden = [...hiddenColumns, id];
    setPref({ preference, value: newHidden.join(',') });
    setHiddenColumns(newHidden);
  };

  useEffect(() => {
    const savedPrefs = getPref(preference);
    setHiddenColumns(savedPrefs ? savedPrefs.split(',') : []);
  }, []);

  if (breakpoint === 'base' || breakpoint === 'sm') {
    return (
      <Menu closeOnSelect={false}>
        <MenuButton as={IconButton} size={size} icon={<FunnelSimple />} />
        <MenuList maxH="200px" overflowY="auto">
          {columns.map((column) => (
            <MenuItem key={uuid()} isDisabled={column.alwaysShow} onClick={() => handleColumnClick(column.id)}>
              <Checkbox
                defaultChecked={!hiddenColumns.find((hidden) => hidden === column.id)}
                isDisabled={column.alwaysShow}
              >
                {column.Header}
              </Checkbox>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    );
  }

  return (
    <Menu closeOnSelect={false}>
      <MenuButton as={Button} size={size} rightIcon={<FunnelSimple />} minWidth="120px">
        {t('common.columns')}
      </MenuButton>
      <MenuList maxH="200px" overflowY="auto">
        {columns.map((column) => (
          <MenuItem key={uuid()} isDisabled={column.alwaysShow} onClick={() => handleColumnClick(column.id)}>
            <Checkbox
              defaultChecked={!hiddenColumns.find((hidden) => hidden === column.id)}
              isDisabled={column.alwaysShow}
            >
              {column.Header}
            </Checkbox>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
