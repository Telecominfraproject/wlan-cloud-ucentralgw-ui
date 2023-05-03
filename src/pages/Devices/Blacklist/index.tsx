import * as React from 'react';
import { Box, Button, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Actions from './Actions';
import CreateBlacklistModal from './CreateModal';
import EditBlacklistModal from './EditModal';
import { DataGrid } from 'components/DataTables/DataGrid';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { BlacklistDevice, useGetBlacklistCount, useGetBlacklistDevices } from 'hooks/Network/Blacklist';

const DeviceListCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [device, setDevice] = React.useState<BlacklistDevice | undefined>();
  const editModalProps = useDisclosure();
  const tableController = useDataGrid({ tableSettingsId: 'gateway.blacklist.table', defaultOrder: [] });
  const getCount = useGetBlacklistCount({ enabled: true });
  const getDevices = useGetBlacklistDevices({
    pageInfo: {
      limit: tableController.pageInfo.pageSize,
      index: tableController.pageInfo.pageIndex,
    },
    enabled: true,
  });

  const goToSerial = (serial: string) => () => {
    navigate(`/devices/${serial}`);
  };

  const handleEdit = (dev: BlacklistDevice) => {
    setDevice(dev);
    editModalProps.onOpen();
  };

  const serialCell = React.useCallback(
    (dev: BlacklistDevice) => (
      <Button variant="link" onClick={goToSerial(dev.serialNumber)} fontSize="sm">
        <pre>{dev.serialNumber}</pre>
      </Button>
    ),
    [],
  );

  const dateCell = React.useCallback((dev: BlacklistDevice) => <FormattedDate date={dev.created} />, []);

  const actionCell = React.useCallback(
    (dev: BlacklistDevice) => <Actions device={dev} refreshTable={getDevices.refetch} onOpenEdit={handleEdit} />,
    [],
  );

  const columns: DataGridColumn<BlacklistDevice>[] = React.useMemo(
    (): DataGridColumn<BlacklistDevice>[] => [
      {
        id: 'serialNumber',
        header: t('inventory.serial_number'),
        accessorKey: 'serialNumber',
        cell: (v) => serialCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          alwaysShow: true,
          customMaxWidth: '200px',
          customWidth: '130px',
          customMinWidth: '130px',
        },
      },
      {
        id: 'created',
        header: t('controller.devices.added'),
        accessorKey: 'created',
        cell: (v) => dateCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customMaxWidth: '200px',
          customWidth: '130px',
          customMinWidth: '130px',
        },
      },
      {
        id: 'author',
        header: t('controller.devices.by'),
        accessorKey: 'author',
        enableSorting: false,
        meta: {
          customMaxWidth: '200px',
          customWidth: '130px',
          customMinWidth: '130px',
        },
      },
      {
        id: 'reason',
        header: t('controller.devices.reason'),
        accessorKey: 'reason',
        enableSorting: false,
      },
      {
        id: 'actions',
        header: t('common.actions'),
        accessorKey: 'actions',
        cell: (v) => actionCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customWidth: '50px',
          alwaysShow: true,
        },
      },
    ],
    [t],
  );
  return (
    <Box>
      <DataGrid<BlacklistDevice>
        controller={tableController}
        header={{
          title: `${getCount.data?.count} ${t('devices.title')}`,
          objectListed: t('devices.title'),
          addButton: <CreateBlacklistModal />,
        }}
        columns={columns}
        data={getDevices.data?.devices}
        isLoading={getCount.isFetching || getDevices.isFetching}
        options={{
          count: getCount.data?.count,
          isManual: true,
          onRowClick: (dev) => goToSerial(dev.serialNumber),
          refetch: getDevices.refetch,
          showAsCard: true,
        }}
      />
      <EditBlacklistModal device={device} modalProps={editModalProps} />
    </Box>
  );
};

export default React.memo(DeviceListCard);
