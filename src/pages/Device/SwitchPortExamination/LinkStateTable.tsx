import * as React from 'react';
import { Alert, AlertDescription, AlertIcon, Center } from '@chakra-ui/react';
import { DeviceLinkState } from 'hooks/Network/Statistics';
import DataCell from 'components/TableCells/DataCell';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import { DataGrid } from 'components/DataTables/DataGrid';
import { uppercaseFirstLetter } from 'helpers/stringHelper';

type Row = DeviceLinkState & { name: string };
const dataCell = (v: number) => <DataCell bytes={v} />;

type Props = {
  statistics?: Row[];
  refetch: () => void;
  isFetching: boolean;
  type: 'upstream' | 'downstream';
};

const LinkStateTable = ({ statistics, refetch, isFetching, type }: Props) => {
  const tableController = useDataGrid({
    tableSettingsId: 'switch.link-state.table',
    defaultOrder: [
      'carrier',
      'name',
      'duplex',
      'speed',
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

  const columns: DataGridColumn<Row>[] = React.useMemo(
    (): DataGridColumn<Row>[] => [
      {
        id: 'carrier',
        header: '',
        accessorKey: '',
        cell: ({ cell }) => (cell.row.original.carrier ? '🟢' : '🔴'),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'name',
        header: 'Name',
        accessorKey: 'name',
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'duplex',
        header: 'Duplex',
        accessorKey: 'duplex',
        cell: ({ cell }) => (cell.row.original.duplex ? uppercaseFirstLetter(cell.row.original.duplex) : '-'),
        meta: {
          customWidth: '35px',
        },
      },
      {
        id: 'speed',
        header: 'Speed',
        accessorKey: 'speed',
        cell: ({ cell }) => `${(cell.row.original.speed ?? 0) / 1000} Gbps`,
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

  if (!statistics || statistics?.length === 0) {
    return (
      <Center>
        <Alert status="info">
          <AlertIcon />
          <AlertDescription>
            There are currently no {type} link-states provided in this devices statistics
          </AlertDescription>
        </Alert>
      </Center>
    );
  }

  return (
    <DataGrid<Row>
      controller={tableController}
      header={{
        title: '',
        objectListed: 'Statistics',
      }}
      columns={columns}
      isLoading={isFetching}
      data={statistics ?? []}
      options={{
        refetch,
        isHidingControls: true,
      }}
    />
  );
};

export default LinkStateTable;
