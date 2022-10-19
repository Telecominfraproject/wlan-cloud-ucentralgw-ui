import * as React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { DeviceLog, useGetDeviceLogs } from 'hooks/Network/DeviceLogs';
import { Column } from 'models/Table';
import FormattedDate from 'components/InformationDisplays/FormattedDate';

type Props = {
  serialNumber: string;
  limit: number;
};

const useDeviceLogsTable = ({ serialNumber, limit }: Props) => {
  const { t } = useTranslation();
  const getLogs = useGetDeviceLogs({ serialNumber, limit });

  const dateCell = React.useCallback(
    (v: number) => (
      <Box>
        <FormattedDate date={v} />
      </Box>
    ),
    [],
  );

  const jsonCell = React.useCallback((v: Record<string, unknown>) => <pre>{JSON.stringify(v, null, 0)}</pre>, []);

  const columns: Column<DeviceLog>[] = React.useMemo(
    (): Column<DeviceLog>[] => [
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
        id: 'severity',
        Header: t('controller.devices.severity'),
        Footer: '',
        accessor: 'severity',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'log',
        Header: 'Log',
        Footer: '',
        accessor: 'log',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'data',
        Header: t('common.details'),
        Footer: '',
        accessor: 'data',
        Cell: (v) => jsonCell(v.cell.row.original.data),
        disableSortBy: true,
      },
    ],
    [t],
  );

  return {
    columns,
    getLogs,
  };
};

export default useDeviceLogsTable;
