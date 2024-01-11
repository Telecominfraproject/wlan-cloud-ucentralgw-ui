import * as React from 'react';
import { Alert, AlertDescription, AlertIcon, Center } from '@chakra-ui/react';
import { DeviceInterfaceStatistics, DeviceStatistics } from 'hooks/Network/Statistics';
import DataCell from 'components/TableCells/DataCell';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import DurationCell from 'components/TableCells/DurationCell';
import { DataGrid } from 'components/DataTables/DataGrid';

const dataCell = (v: number) => <DataCell bytes={v} />;

type Props = {
  statistics: DeviceStatistics;
  refetch: () => void;
  isFetching: boolean;
};

const SwitchInterfaceTable = ({ statistics, refetch, isFetching }: Props) => {
  const tableController = useDataGrid({
    tableSettingsId: 'switch.interfaces.table',
    defaultOrder: [
      'name',
      'uptime',
      'clients',
      'rx_bytes',
      'rx_dropped',
      'rx_error',
      'rx_packets',
      'tx_bytes',
      'tx_dropped',
      'tx_error',
    ],
    defaultSortBy: [{ id: 'name', desc: false }],
  });

  const columns: DataGridColumn<DeviceInterfaceStatistics>[] = React.useMemo(
    (): DataGridColumn<DeviceInterfaceStatistics>[] => [
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'uptime',
        header: 'Uptime',

        accessorKey: 'uptime',
        cell: ({ cell }) => <DurationCell seconds={cell.row.original.uptime} />,
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'clients',
        header: 'Clients',

        accessorKey: 'clients',
        cell: ({ cell }) => cell.row.original.clients?.length ?? 0,
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'rx_bytes',
        header: 'Rx',
        accessorKey: 'rx_bytes',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.rx_bytes ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'rx_dropped',
        header: 'Rx Dropped',
        accessorKey: 'rx_dropped',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.rx_dropped ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'rx_error',
        header: 'Rx Errors',
        accessorKey: 'rx_error',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.rx_errors ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'rx_packets',
        header: 'Rx Packets',
        accessorKey: 'counters.rx_packets',
        cell: ({ cell }) => (cell.row.original.counters?.rx_packets ?? 0).toLocaleString(),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'tx_bytes',
        header: 'Tx',
        accessorKey: 'tx_bytes',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.tx_bytes ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'tx_dropped',
        header: 'Tx Dropped',
        accessorKey: 'tx_dropped',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.tx_dropped ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'tx_error',
        header: 'Tx Errors',
        accessorKey: 'tx_error',
        cell: ({ cell }) => dataCell(cell.row.original.counters?.tx_errors ?? 0),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'tx_packets',
        header: 'Tx Packets',
        accessorKey: 'counters.tx_packets',
        cell: ({ cell }) => (cell.row.original.counters?.tx_packets ?? 0).toLocaleString(),
        meta: {
          customWidth: '35px',
        },
      },
    ],
    [],
  );

  if (!statistics.interfaces) {
    return (
      <Center>
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>There are currently no interfaces provided in this devices statistics</AlertDescription>
        </Alert>
      </Center>
    );
  }

  return (
    <DataGrid<DeviceInterfaceStatistics>
      controller={tableController}
      header={{
        title: '',
        objectListed: 'Statistics',
      }}
      columns={columns}
      isLoading={isFetching}
      data={statistics.interfaces ?? []}
      options={{
        refetch,
        isHidingControls: true,
      }}
    />
  );
};

export default SwitchInterfaceTable;
