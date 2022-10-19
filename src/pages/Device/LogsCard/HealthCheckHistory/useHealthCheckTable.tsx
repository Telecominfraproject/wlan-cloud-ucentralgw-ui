import * as React from 'react';
import { Badge, Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { HealthCheck, useGetHealthChecks } from 'hooks/Network/HealthChecks';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
  limit: number;
};

const useHealthCheckTable = ({ serialNumber, limit }: Props) => {
  const { t } = useTranslation();
  const getHealthChecks = useGetHealthChecks({ serialNumber, limit });

  const dateCell = React.useCallback(
    (v: number) => (
      <Box>
        <FormattedDate date={v} />
      </Box>
    ),
    [],
  );
  const sanityCell = React.useCallback((v: number) => {
    let colorScheme = 'red';
    if (v === 100) colorScheme = 'green';
    else if (v >= 80) colorScheme = 'yellow';

    return (
      <Badge colorScheme={colorScheme} variant="solid">
        {v}
      </Badge>
    );
  }, []);
  const jsonCell = React.useCallback((v: Record<string, unknown>) => <pre>{JSON.stringify(v, null, 0)}</pre>, []);

  const columns: Column<HealthCheck>[] = React.useMemo(
    (): Column<HealthCheck>[] => [
      {
        id: 'submitted',
        Header: t('common.submitted'),
        Footer: '',
        accessor: 'submitted',
        Cell: (v) => dateCell(v.cell.row.original.recorded),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'UUID',
        Header: t('controller.devices.config_id'),
        Footer: '',
        accessor: 'UUID',
        customWidth: '35px',
        alwaysShow: true,
        disableSortBy: true,
      },
      {
        id: 'sanity',
        Header: t('devices.sanity'),
        Footer: '',
        accessor: 'sanity',
        Cell: (v) => sanityCell(v.cell.row.original.sanity),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'values',
        Header: t('common.details'),
        Footer: '',
        accessor: 'values',
        Cell: (v) => jsonCell(v.cell.row.original.values),
        customWidth: '35px',
        disableSortBy: true,
      },
    ],
    [t],
  );

  return {
    columns,
    getHealthChecks,
  };
};

export default useHealthCheckTable;
