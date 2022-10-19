import { DataTable } from 'components/DataTables/DataTable';
import { compactDate } from 'helpers/dateFormatting';
import { Column } from 'models/Table';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  certificates?: { expiresOn: number; filename: string }[];
}

const defaultProps = {
  certificates: [],
};

const SystemCertificatesTable: React.FC<Props> = ({ certificates }) => {
  const { t } = useTranslation();

  const memoizedExpiry = useCallback((expiresOn: number) => compactDate(expiresOn), []);

  const columns = React.useMemo(
    (): Column<{ expiresOn: number; filename: string }>[] => [
      {
        id: 'expiresOn',
        Header: t('certificates.expires_on'),
        Footer: '',
        accessor: 'expiresOn',
        Cell: ({ cell }) => memoizedExpiry(cell.row.original.expiresOn),
        customWidth: 'calc(15vh)',
        customMinWidth: '150px',
        hasPopover: true,
      },
      {
        id: 'filename',
        Header: t('certificates.filename'),
        Footer: '',
        accessor: 'filename',
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={certificates ?? []}
      obj={t('certificates.title')}
      hideControls
      sortBy={[
        {
          id: 'started',
          desc: true,
        },
      ]}
    />
  );
};

SystemCertificatesTable.defaultProps = defaultProps;
export default SystemCertificatesTable;
