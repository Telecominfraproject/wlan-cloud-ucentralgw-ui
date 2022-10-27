import { SortInfo } from 'models/Table';

export const isColumnSorted = (colId: string, sortInfo: SortInfo) =>
  sortInfo.findIndex((info) => info.id === colId) >= 0;
export const isSortedDesc = (colId: string, sortInfo: SortInfo) => {
  const found = sortInfo.find((info) => info.id === colId);
  if (found) return found.sort === 'dsc';
  return false;
};
export const onSortClick = (
  colId: string,
  sortInfo: SortInfo,
  setSortInfo: React.Dispatch<React.SetStateAction<SortInfo>>,
) => {
  const found = sortInfo.find((info) => info.id === colId);

  if (found && found.sort === 'asc') {
    const newSortInfo: SortInfo = sortInfo.map((info) => (info.id === colId ? { id: colId, sort: 'dsc' } : info));
    setSortInfo(newSortInfo);
  } else if (found && found.sort === 'dsc') {
    const newSortInfo = sortInfo.filter((info) => info.id !== colId);
    setSortInfo(newSortInfo);
  } else {
    const newSortInfo: SortInfo = [...sortInfo, { id: colId, sort: 'asc' }];
    setSortInfo(newSortInfo);
  }
};
