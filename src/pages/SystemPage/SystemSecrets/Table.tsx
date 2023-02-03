import * as React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../../../components/DataTables/DataTable';
import SystemSecretActions from './Actions';
import { Secret, useGetAllSystemSecrets, useGetSystemSecretsDictionary } from 'hooks/Network/Secrets';
import { Column } from 'models/Table';

const SystemSecretsTable = () => {
  const { t } = useTranslation();
  const getSecrets = useGetAllSystemSecrets();
  const getDictionary = useGetSystemSecretsDictionary();

  const descriptionCell = React.useCallback(
    (secret: Secret) => {
      if (!getDictionary.data) return '-';

      return getDictionary.data.find((d) => d.key === secret.key)?.description ?? '-';
    },
    [getDictionary.data],
  );

  const actionCell = React.useCallback((secret: Secret) => <SystemSecretActions secret={secret} />, []);

  const columns = React.useMemo(
    (): Column<Secret>[] => [
      {
        id: 'key',
        Header: t('common.name'),
        Footer: '',
        accessor: 'key',
        alwaysShow: true,
        customWidth: '120px',
      },
      {
        id: 'description',
        Header: t('common.description'),
        Footer: '',
        Cell: ({ cell }) => descriptionCell(cell.row.original),
        accessor: 'description',
        hasPopover: true,
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
    [t, descriptionCell],
  );
  return (
    <Box w="100%">
      <DataTable
        columns={columns as Column<object>[]}
        saveSettingsId="system.secrets.table"
        data={getSecrets.data ?? []}
        obj={t('keys.other')}
        sortBy={[{ id: 'key', desc: false }]}
        showAllRows
        hideControls
      />
    </Box>
  );
};

export default SystemSecretsTable;
