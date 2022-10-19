import * as React from 'react';
import { Box, Button, Heading, Spacer, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Actions from './Actions';
import CreateBlacklistModal from './CreateModal';
import EditBlacklistModal from './EditModal';
import { Column, PageInfo } from 'models/Table';
import { BlacklistDevice, useGetBlacklistCount, useGetBlacklistDevices } from 'hooks/Network/Blacklist';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { CardBody } from 'components/Containers/Card/CardBody';
import { DataTable } from 'components/DataTables/DataTable';

const DeviceListCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pageInfo, setPageInfo] = React.useState<PageInfo | undefined>(undefined);
  const [device, setDevice] = React.useState<BlacklistDevice | undefined>();
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const editModalProps = useDisclosure();
  const getCount = useGetBlacklistCount({ enabled: true });
  const getDevices = useGetBlacklistDevices({
    pageInfo,
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

  const columns: Column<BlacklistDevice>[] = React.useMemo(
    (): Column<BlacklistDevice>[] => [
      {
        id: 'serialNumber',
        Header: t('inventory.serial_number'),
        Footer: '',
        accessor: 'serialNumber',
        Cell: (v) => serialCell(v.cell.row.original),
        alwaysShow: true,
        customMaxWidth: '200px',
        customWidth: '130px',
        customMinWidth: '130px',
        disableSortBy: true,
      },
      {
        id: 'created',
        Header: t('controller.devices.added'),
        Footer: '',
        accessor: 'created',
        Cell: (v) => dateCell(v.cell.row.original),
        customMaxWidth: '200px',
        customWidth: '130px',
        customMinWidth: '130px',
        disableSortBy: true,
      },
      {
        id: 'author',
        Header: t('controller.devices.by'),
        Footer: '',
        accessor: 'author',
        customMaxWidth: '200px',
        customWidth: '130px',
        customMinWidth: '130px',
        disableSortBy: true,
      },
      {
        id: 'reason',
        Header: t('controller.devices.reason'),
        Footer: '',
        accessor: 'reason',
        disableSortBy: true,
      },
      {
        id: 'actions',
        Header: t('common.actions'),
        Footer: '',
        accessor: 'actions',
        Cell: (v) => actionCell(v.cell.row.original),
        customWidth: '50px',
        alwaysShow: true,
        disableSortBy: true,
      },
    ],
    [t],
  );
  return (
    <>
      <CardHeader px={4} pt={4}>
        <Heading size="md" my="auto" mr={2}>
          {getCount.data?.count} {t('devices.title')}
        </Heading>
        <Spacer />
        <ColumnPicker
          columns={columns as Column<unknown>[]}
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          preference="gateway.blacklist.table.hiddenColumns"
        />
        <CreateBlacklistModal />
        <RefreshButton
          ml={2}
          onClick={() => {
            getDevices.refetch();
            getCount.refetch();
          }}
          isFetching={getDevices.isFetching || getCount.isFetching}
          isCompact
        />
      </CardHeader>
      <CardBody p={4}>
        <Box overflowX="auto" w="100%">
          <DataTable
            columns={
              columns as {
                id: string;
                Header: string;
                Footer: string;
                accessor: string;
              }[]
            }
            data={getDevices.data?.devices ?? []}
            isLoading={getCount.isFetching || getDevices.isFetching}
            isManual
            hiddenColumns={hiddenColumns}
            obj={t('devices.title')}
            count={getCount.data?.count || 0}
            // @ts-ignore
            setPageInfo={setPageInfo}
            minHeight="300px"
            saveSettingsId="gateway.blacklist.table"
          />
        </Box>
      </CardBody>
      <EditBlacklistModal device={device} modalProps={editModalProps} />
    </>
  );
};

export default React.memo(DeviceListCard);
