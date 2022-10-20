import * as React from 'react';
import { Box, Button, Heading, Image, Spacer, Tooltip, useDisclosure } from '@chakra-ui/react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Actions from './Actions';
import DeviceSearchBar from './DeviceSearchBar';
import DeviceListFirmwareButton from './FirmwareButton';
import AP from './icons/AP.png';
import IOT from './icons/IOT.png';
import MESH from './icons/MESH.png';
import SWITCH from './icons/SWITCH.png';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { ConfigureModal } from 'components/Modals/ConfigureModal';
import { EventQueueModal } from 'components/Modals/EventQueueModal';
import FactoryResetModal from 'components/Modals/FactoryResetModal';
import { FirmwareUpgradeModal } from 'components/Modals/FirmwareUpgradeModal';
import { TelemetryModal } from 'components/Modals/TelemetryModal';
import { TraceModal } from 'components/Modals/TraceModal';
import { WifiScanModal } from 'components/Modals/WifiScanModal';
import DataCell from 'components/TableCells/DataCell';
import NumberCell from 'components/TableCells/NumberCell';
import { DeviceWithStatus, useGetDeviceCount, useGetDevices } from 'hooks/Network/Devices';
import { FirmwareAgeResponse, useGetFirmwareAges } from 'hooks/Network/Firmware';
import { Column, PageInfo } from 'models/Table';

const ICON_STYLE = { width: '24px', height: '24px', borderRadius: '20px' };

const ICONS = {
  AP: <Image borderRadius="full" boxSize="25px" src={AP} left="auto" right="auto" />,
  SWITCH: <Image borderRadius="full" boxSize="25px" src={SWITCH} left="auto" right="auto" />,
  IOT: <Image borderRadius="full" boxSize="25px" src={IOT} left="auto" right="auto" />,
  MESH: <Image borderRadius="full" boxSize="25px" src={MESH} left="auto" right="auto" />,
};

const BADGE_COLORS: Record<string, string> = {
  VALID_CERTIFICATE: 'red',
  NO_CERTIFICATE: 'red',
  MISMATCH_SERIAL: 'yellow',
  VERIFIED: 'green',
};

const DeviceListCard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [serialNumber, setSerialNumber] = React.useState<string>('');
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const [pageInfo, setPageInfo] = React.useState<PageInfo | undefined>(undefined);
  const scanModalProps = useDisclosure();
  const resetModalProps = useDisclosure();
  const upgradeModalProps = useDisclosure();
  const traceModalProps = useDisclosure();
  const eventQueueProps = useDisclosure();
  const telemetryModalProps = useDisclosure();
  const configureModalProps = useDisclosure();
  const getCount = useGetDeviceCount({ enabled: true });
  const getDevices = useGetDevices({
    pageInfo,
    enabled: true,
  });
  const getAges = useGetFirmwareAges({
    serialNumbers: getDevices.data?.devicesWithStatus.map((device) => device.serialNumber),
  });

  const onOpenScan = (serial: string) => {
    setSerialNumber(serial);
    scanModalProps.onOpen();
  };
  const onOpenFactoryReset = (serial: string) => {
    setSerialNumber(serial);
    resetModalProps.onOpen();
  };
  const onOpenUpgradeModal = (serial: string) => {
    setSerialNumber(serial);
    upgradeModalProps.onOpen();
  };
  const onOpenTrace = (serial: string) => {
    setSerialNumber(serial);
    traceModalProps.onOpen();
  };
  const onOpenEventQueue = (serial: string) => {
    setSerialNumber(serial);
    eventQueueProps.onOpen();
  };
  const onOpenTelemetry = (serial: string) => {
    setSerialNumber(serial);
    telemetryModalProps.onOpen();
  };
  const onOpenConfigure = (serial: string) => {
    setSerialNumber(serial);
    configureModalProps.onOpen();
  };

  const goToSerial = (serial: string) => () => {
    navigate(`/devices/${serial}`);
  };

  const badgeCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Box
        h="35px"
        w="35px"
        borderRadius="50em"
        bgColor={BADGE_COLORS[device.verifiedCertificate] ?? 'red'}
        alignItems="center"
        display="inline-flex"
        justifyContent="center"
        position="relative"
      >
        <Tooltip
          label={`${device.verifiedCertificate} - ${
            device.connected ? t('common.connected') : t('common.disconnected')
          }`}
        >
          {ICONS[device.deviceType]}
        </Tooltip>
        <Box
          w="0.65em"
          h="0.65em"
          borderRadius="full"
          position="absolute"
          bg={device.connected ? 'green' : 'red'}
          right={0.5}
          bottom={0}
          borderColor="gray.200"
          borderWidth={1}
        />
      </Box>
    ),
    [],
  );

  const serialCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Button variant="link" onClick={goToSerial(device.serialNumber)} fontSize="sm">
        <pre>{device.serialNumber}</pre>
      </Button>
    ),
    [],
  );
  const dataCell = React.useCallback(
    (v: number) => (
      <Box textAlign="right">
        <DataCell bytes={v} />
      </Box>
    ),
    [],
  );
  const dateCell = React.useCallback(
    (v: number | string) =>
      v !== undefined && typeof v === 'number' && v !== 0 ? <FormattedDate date={v as number} /> : '-',
    [],
  );
  const firmwareCell = React.useCallback(
    (device: DeviceWithStatus & { age?: FirmwareAgeResponse }) => (
      <DeviceListFirmwareButton device={device} age={device.age} onOpenUpgrade={onOpenUpgradeModal} />
    ),
    [getAges],
  );
  const localeCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Tooltip label={`${device.locale !== '' ? `${device.locale} - ` : ''}${device.ipAddress}`} placement="top">
        <Box w="100%" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
          {device.locale !== '' && device.ipAddress !== '' && (
            <ReactCountryFlag style={ICON_STYLE} countryCode={device.locale} svg />
          )}
          {`  ${device.ipAddress}`}
        </Box>
      </Tooltip>
    ),
    [],
  );
  const numberCell = React.useCallback((v: number) => <NumberCell value={v} />, []);
  const actionCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Actions
        device={device}
        refreshTable={getDevices.refetch}
        onOpenScan={onOpenScan}
        onOpenFactoryReset={onOpenFactoryReset}
        onOpenUpgradeModal={onOpenUpgradeModal}
        onOpenTrace={onOpenTrace}
        onOpenEventQueue={onOpenEventQueue}
        onOpenConfigureModal={onOpenConfigure}
        onOpenTelemetryModal={onOpenTelemetry}
      />
    ),
    [],
  );

  const columns: Column<DeviceWithStatus>[] = React.useMemo(
    (): Column<DeviceWithStatus>[] => [
      {
        id: 'badge',
        Header: '',
        Footer: '',
        accessor: 'badge',
        Cell: (v) => badgeCell(v.cell.row.original),
        customWidth: '35px',
        alwaysShow: true,
        disableSortBy: true,
      },
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
        id: 'firmware',
        Header: t('commands.revision'),
        Footer: '',
        accessor: 'firmware',
        Cell: (v) => firmwareCell(v.cell.row.original),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: 'compatible',
        Header: t('common.type'),
        Footer: '',
        accessor: 'compatible',
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: 'IP',
        Header: 'IP',
        Footer: '',
        accessor: 'IP',
        Cell: (v) => localeCell(v.cell.row.original),
        disableSortBy: true,
      },
      {
        id: 'lastContact',
        Header: t('analytics.last_contact'),
        Footer: '',
        accessor: 'lastContact',
        Cell: (v) => dateCell(v.cell.row.original.lastContact),
        disableSortBy: true,
      },
      {
        id: 'lastFWUpdate',
        Header: t('controller.devices.last_upgrade'),
        Footer: '',
        accessor: 'lastFWUpdate',
        Cell: (v) => dateCell(v.cell.row.original.lastFWUpdate),
        disableSortBy: true,
      },
      {
        id: 'rxBytes',
        Header: 'Rx',
        Footer: '',
        accessor: 'rxBytes',
        Cell: (v) => dataCell(v.cell.row.original.rxBytes),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: 'txBytes',
        Header: 'Tx',
        Footer: '',
        accessor: 'txBytes',
        Cell: (v) => dataCell(v.cell.row.original.txBytes),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: '2G',
        Header: '2G',
        Footer: '',
        accessor: 'associations_2G',
        Cell: (v) => numberCell(v.cell.row.original.associations_2G),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: '5G',
        Header: '5G',
        Footer: '',
        accessor: 'associations_5G',
        Cell: (v) => numberCell(v.cell.row.original.associations_5G),
        customWidth: '50px',
        disableSortBy: true,
      },
      {
        id: '6G',
        Header: '6G',
        Footer: '',
        accessor: 'associations_6G',
        Cell: () => numberCell(0),
        customWidth: '50px',
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
    [t, firmwareCell],
  );

  const data = React.useMemo(() => {
    if (!getDevices.data) return [];
    return getDevices.data.devicesWithStatus.map((device) => ({
      ...device,
      age: getAges?.data?.ages.find(({ serialNumber: devSerial }) => devSerial === device.serialNumber),
    }));
  }, [getAges, getDevices]);

  return (
    <>
      <CardHeader px={4} pt={4}>
        <Heading size="md" my="auto" mr={2}>
          {getCount.data?.count} {t('devices.title')}
        </Heading>
        <DeviceSearchBar />
        <Spacer />
        <ColumnPicker
          columns={columns as Column<unknown>[]}
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          preference="gateway.devices.table.hiddenColumns"
        />
        <RefreshButton
          onClick={() => {
            getDevices.refetch();
            getCount.refetch();
          }}
          isCompact
          ml={2}
          isFetching={getCount.isFetching || getDevices.isFetching}
        />
      </CardHeader>
      <CardBody p={4}>
        <Box overflowX="auto" w="100%">
          <DataTable
            columns={
              columns.filter(({ id }) => !hiddenColumns.find((hidden) => hidden === id)) as {
                id: string;
                Header: string;
                Footer: string;
                accessor: string;
              }[]
            }
            data={data ?? []}
            isLoading={getCount.isFetching || getDevices.isFetching}
            isManual
            hiddenColumns={hiddenColumns}
            obj={t('devices.title')}
            count={getCount.data?.count || 0}
            // @ts-ignore
            setPageInfo={setPageInfo}
            saveSettingsId="gateway.devices.table"
          />
        </Box>
      </CardBody>
      <WifiScanModal modalProps={scanModalProps} serialNumber={serialNumber} />
      <FirmwareUpgradeModal modalProps={upgradeModalProps} serialNumber={serialNumber} />
      <FactoryResetModal modalProps={resetModalProps} serialNumber={serialNumber} />
      <TraceModal modalProps={traceModalProps} serialNumber={serialNumber} />
      <EventQueueModal modalProps={eventQueueProps} serialNumber={serialNumber} />
      <ConfigureModal modalProps={configureModalProps} serialNumber={serialNumber} />
      <TelemetryModal modalProps={telemetryModalProps} serialNumber={serialNumber} />
    </>
  );
};

export default React.memo(DeviceListCard);
