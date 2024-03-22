import * as React from 'react';
import { ColumnDef, PaginationState, SortingColumnDef, SortingState, VisibilityState } from '@tanstack/react-table';
import { useAuth } from 'contexts/AuthProvider';

const getDefaultSettings = ({ settings, showAllRows }: { settings?: string; showAllRows?: boolean }) => {
  if (showAllRows) return { pageSize: 1000, pageIndex: 0 };
  let limit = 10;
  let index = 0;

  if (settings) {
    const savedSizeSetting = localStorage.getItem(settings);
    if (savedSizeSetting) {
      try {
        limit = parseInt(savedSizeSetting, 10);
      } catch (e) {
        limit = 10;
      }
    }

    const savedPageSetting = localStorage.getItem(`${settings}.page`);
    if (savedPageSetting) {
      try {
        index = parseInt(savedPageSetting, 10);
      } catch (e) {
        index = 0;
      }
    }
  }

  return {
    pageSize: limit,
    pageIndex: index,
  };
};

const getSavedColumnOrder = (defaultValue: string[], settings?: string) => {
  if (settings) {
    const savedOrderSetting = localStorage.getItem(`${settings}.order`);
    if (savedOrderSetting) {
      try {
        const savedOrder = JSON.parse(savedOrderSetting);
        return savedOrder.length > 0 ? savedOrder : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }
  }

  return defaultValue;
};

export type DataGridColumn<T> = ColumnDef<T> & SortingColumnDef<T> & { id: string };

export type UseDataGridProps = {
  tableSettingsId: string;
  defaultOrder: string[];
  defaultSortBy?: SortingState;
  showAllRows?: boolean;
};

export const useDataGrid = ({ tableSettingsId, defaultSortBy, defaultOrder, showAllRows }: UseDataGridProps) => {
  const orderSetting = `${tableSettingsId}.order`;
  const hiddenColumnSetting = `${tableSettingsId}.hiddenColumns`;
  const pageSetting = `${tableSettingsId}.page`;
  const { getPref, setPref, setPrefs, deletePref } = useAuth();
  const [sortBy, setSortBy] = React.useState<SortingState>(defaultSortBy ?? []);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    getSavedColumnOrder(defaultOrder ?? [], tableSettingsId),
  );
  const [pageInfo, setPageInfo] = React.useState<PaginationState>(
    getDefaultSettings({ settings: tableSettingsId, showAllRows }),
  );
  const setNewColumnOrder = React.useCallback(
    (newOrder: string[]) => {
      setColumnOrder(newOrder);
      if (tableSettingsId) {
        localStorage.setItem(orderSetting, JSON.stringify(newOrder));
        setPref({ preference: orderSetting, value: newOrder.join(',') });
      }
    },
    [setPref],
  );

  const resetPreferences = React.useCallback(async () => {
    if (tableSettingsId) {
      localStorage.removeItem(orderSetting);
      localStorage.removeItem(hiddenColumnSetting);
      await deletePref([orderSetting, hiddenColumnSetting]);
    }

    setColumnOrder(defaultOrder ?? []);
    setColumnVisibility({});
  }, [deletePref]);

  const hideColumn = React.useCallback(
    (id: string) => {
      const newVisibility = { ...columnVisibility };
      newVisibility[id] = false;
      let hiddenColumnsArray = Object.entries(newVisibility)
        .filter(([, value]) => !value)
        .map(([key]) => key);
      hiddenColumnsArray = [...new Set(hiddenColumnsArray)]; // Remove duplicates

      // New column order without hidden columns
      let filteredColumnOrder = columnOrder.filter((columnId) => !hiddenColumnsArray.includes(columnId));
      filteredColumnOrder = [...new Set(filteredColumnOrder)]; // Remove duplicates

      setPrefs([
        { tag: hiddenColumnSetting, value: hiddenColumnsArray.join(',') },
        { tag: orderSetting, value: filteredColumnOrder.join(',') },
      ]);
      setColumnVisibility({ ...newVisibility });
      setColumnOrder(filteredColumnOrder);
      localStorage.setItem(orderSetting, JSON.stringify(filteredColumnOrder));
      localStorage.setItem(hiddenColumnSetting, hiddenColumnsArray.join(','));

      return {
        hiddenColumns: hiddenColumnsArray,
        columnOrder: filteredColumnOrder,
      };
    },
    [columnOrder, columnVisibility, setPrefs],
  );

  const unhideColumn = React.useCallback(
    (id: string, newOrder: string[]) => {
      const newVisibility = { ...columnVisibility };
      newVisibility[id] = true;
      let hiddenColumnsArray = Object.entries(newVisibility)
        .filter(([, value]) => !value)
        .map(([key]) => key);
      hiddenColumnsArray = [...new Set(hiddenColumnsArray)]; // Remove duplicates

      const newColumnOrder = [...new Set(newOrder)]; // Remove duplicates

      setPrefs([
        { tag: hiddenColumnSetting, value: hiddenColumnsArray.join(',') },
        { tag: orderSetting, value: newColumnOrder.join(',') },
      ]);
      setColumnVisibility({ ...newVisibility });
      setColumnOrder(newColumnOrder);
      localStorage.setItem(orderSetting, JSON.stringify(newColumnOrder));
      localStorage.setItem(hiddenColumnSetting, hiddenColumnsArray.join(','));

      return {
        hiddenColumns: hiddenColumnsArray,
        columnOrder: newColumnOrder,
      };
    },
    [columnOrder, columnVisibility, setPrefs],
  );

  React.useEffect(() => {
    const savedPrefs = getPref(hiddenColumnSetting);

    if (savedPrefs) {
      const savedHiddenColumns = savedPrefs.split(',');
      setColumnVisibility(savedHiddenColumns.reduce((acc, curr) => ({ ...acc, [curr]: false }), {}));
    } else {
      setColumnVisibility({});
    }

    const savedOrderSetting = getPref(orderSetting);

    if (savedOrderSetting) {
      const savedHiddenColumns = savedOrderSetting.split(',');
      setColumnOrder(savedHiddenColumns);
    }
  }, [tableSettingsId]);

  React.useEffect(() => {
    if (tableSettingsId) {
      localStorage.setItem(pageSetting, String(pageInfo.pageIndex));
      if (tableSettingsId) localStorage.setItem(`${tableSettingsId}`, String(pageInfo.pageSize));
    }
  }, [pageInfo.pageIndex, pageInfo.pageSize]);

  return React.useMemo(
    () => ({
      tableSettingsId,
      pageInfo,
      sortBy,
      setSortBy,
      columnOrder,
      setColumnOrder: setNewColumnOrder,
      hideColumn,
      unhideColumn,
      columnVisibility,
      setColumnVisibility,
      onPaginationChange: setPageInfo,
      resetPreferences,
    }),
    [pageInfo, hideColumn, unhideColumn, columnVisibility, sortBy, columnOrder, setNewColumnOrder],
  );
};

export type UseDataGridReturn = ReturnType<typeof useDataGrid>;
