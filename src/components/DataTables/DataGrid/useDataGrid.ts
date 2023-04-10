import * as React from 'react';
import {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingColumnDef,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table';

const getDefaultSettings = (settings?: string) => {
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

export type DataGridColumn<T> = ColumnDef<T> & SortingColumnDef<T> & { id: string };

export type UseDataGridReturn = {
  tableSettingsId: string;
  pageInfo: PaginationState;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  sortBy: SortingState;
  setSortBy: React.Dispatch<React.SetStateAction<SortingState>>;
  onPaginationChange: OnChangeFn<PaginationState>;
};

export type UseDataGridProps = {
  tableSettingsId: string;
  defaultSortBy?: SortingState;
};

export const useDataGrid = ({ tableSettingsId, defaultSortBy }: UseDataGridProps): UseDataGridReturn => {
  const [sortBy, setSortBy] = React.useState<SortingState>(defaultSortBy ?? []);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [pageInfo, setPageInfo] = React.useState<PaginationState>(getDefaultSettings(tableSettingsId));

  React.useEffect(() => {
    if (tableSettingsId) {
      localStorage.setItem(`${tableSettingsId}.page`, String(pageInfo.pageIndex));
      if (tableSettingsId) localStorage.setItem(`${tableSettingsId}`, String(pageInfo.pageSize));
    }
  }, [pageInfo.pageIndex, pageInfo.pageSize]);

  return React.useMemo(
    () => ({
      tableSettingsId,
      pageInfo,
      sortBy,
      setSortBy,
      columnVisibility,
      setColumnVisibility,
      onPaginationChange: setPageInfo,
    }),
    [pageInfo, columnVisibility, sortBy],
  );
};
