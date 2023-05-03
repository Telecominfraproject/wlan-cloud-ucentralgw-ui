/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import { Box } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DeviceRadiusActions from './ActionCell';
import { DataGrid } from 'components/DataTables/DataGrid';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import DataCell from 'components/TableCells/DataCell';
import DurationCell from 'components/TableCells/DurationCell';
import { RadiusSession } from 'hooks/Network/Radius';

type Props = {
  sessions: RadiusSession[];
  refetch: () => void;
  isFetching: boolean;
  onAnalysisOpen: (mac: string) => (() => void) | undefined;
};

const DeviceRadiusClientsTable = ({ sessions, refetch, isFetching, onAnalysisOpen }: Props) => {
  const { t } = useTranslation();
  const tableController = useDataGrid({
    tableSettingsId: 'gateway.device_radius_sessions.table',
    defaultSortBy: [
      {
        id: 'callingStationId',
        desc: false,
      },
    ],
    defaultOrder: ['callingStationId', 'userName', 'sessionTime', 'inputOctets', 'outputOctets', 'actions'],
  });

  const columns: DataGridColumn<RadiusSession>[] = React.useMemo(
    (): DataGridColumn<RadiusSession>[] => [
      {
        id: 'callingStationId',
        header: t('controller.radius.calling_station_id'),
        accessorKey: 'callingStationId',
        cell: ({ cell }) => {
          let { callingStationId } = cell.row.original;
          callingStationId = callingStationId.replace(/-/g, ':').toLowerCase();
          return (
            <div className="flex items-center">
              <div className="flex-1">{callingStationId}</div>
            </div>
          );
        },
        meta: {
          customWidth: '150px',
          isMonospace: true,
          alwaysShow: true,
        },
      },
      {
        id: 'userName',
        header: t('controller.radius.username'),
        accessorKey: 'userName',
        meta: {
          alwaysShow: true,
        },
      },
      {
        id: 'sessionTime',
        header: t('controller.radius.session_time'),
        accessorKey: 'sessionTime',
        cell: ({ cell }) => {
          const { sessionTime } = cell.row.original;
          return <DurationCell seconds={sessionTime} />;
        },
        meta: {
          customWidth: '120px',
        },
      },
      {
        id: 'inputOctets',
        header: t('controller.radius.input_octets'),
        accessorKey: 'inputOctets',
        cell: ({ cell }) => {
          const { inputOctets } = cell.row.original;
          return (
            <Box textAlign="right">
              <DataCell bytes={inputOctets} showZerosAs="-" />
            </Box>
          );
        },
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: 'outputOctets',
        header: t('controller.radius.output_octets'),
        accessorKey: 'outputOctets',
        cell: ({ cell }) => {
          const { outputOctets } = cell.row.original;
          return (
            <Box textAlign="right">
              <DataCell bytes={outputOctets} showZerosAs="-" />
            </Box>
          );
        },
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ cell }) => <DeviceRadiusActions session={cell.row.original} onAnalysisOpen={onAnalysisOpen} />,
        meta: {
          alwaysShow: true,
          columnSelectorOptions: {
            label: t('common.actions'),
          },
        },
      },
    ],
    [t],
  );

  return (
    <DataGrid<RadiusSession>
      controller={tableController}
      header={{
        title: `${t('controller.radius.radius_clients')} (${sessions.length})`,
        objectListed: t('controller.radius.radius_clients'),
      }}
      columns={columns}
      data={sessions}
      isLoading={isFetching}
      options={{
        refetch,
        minimumHeight: '200px',
        onRowClick: (session) => onAnalysisOpen(session.callingStationId),
        showAsCard: true,
      }}
    />
  );
};

export default DeviceRadiusClientsTable;
