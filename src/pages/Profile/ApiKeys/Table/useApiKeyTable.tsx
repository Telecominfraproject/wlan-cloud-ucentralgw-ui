import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ApiKeyActions from './Actions';
import ApiKeyDescriptionCell from './DescriptionCell';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { ApiKey, useGetUserApiKeys } from 'hooks/Network/ApiKeys';
import { Column } from 'models/Table';

type Props = {
  userId: string;
};

const useApiKeyTable = ({ userId }: Props) => {
  const { t } = useTranslation();
  const hiddenColumns = React.useState<string[]>([]);
  const query = useGetUserApiKeys({ userId });

  const dateCell = React.useCallback((date: number) => <FormattedDate date={date} />, []);
  const actionCell = React.useCallback((apiKey: ApiKey) => <ApiKeyActions apiKey={apiKey} />, []);
  const descriptionCell = React.useCallback((apiKey: ApiKey) => <ApiKeyDescriptionCell apiKey={apiKey} />, []);

  const columns = React.useMemo(
    (): Column<ApiKey>[] => [
      {
        id: 'name',
        Header: t('common.name'),
        Footer: '',
        accessor: 'name',
        alwaysShow: true,
        customWidth: '120px',
      },
      {
        id: 'expiresOn',
        Header: t('keys.expires'),
        Footer: '',
        Cell: ({ cell }) => dateCell(cell.row.original.expiresOn),
        accessor: 'expiresOn',
        customWidth: '120px',
      },
      {
        id: 'lastUse',
        Header: t('common.last_use'),
        Footer: '',
        Cell: ({ cell }) => dateCell(cell.row.original.lastUse),
        accessor: 'lastUse',
        customWidth: '120px',
      },
      {
        id: 'description',
        Header: t('common.description'),
        Footer: '',
        Cell: ({ cell }) => descriptionCell(cell.row.original),
        accessor: 'description',
      },
      {
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        Cell: (v) => actionCell(v.cell.row.original),
        disableSortBy: true,
        customWidth: '120px',
        alwaysShow: true,
      },
    ],
    [t],
  );

  return React.useMemo(
    () => ({
      query,
      columns,
      hiddenColumns,
    }),
    [query, columns, hiddenColumns],
  );
};

export default useApiKeyTable;
