import * as React from 'react';
import { Box, Center, Image, Link, Tag, TagLabel, TagRightIcon, Tooltip, useDisclosure } from '@chakra-ui/react';
import {
  CheckCircle,
  Heart,
  HeartBreak,
  LockSimple,
  ThermometerCold,
  ThermometerHot,
  WarningCircle,
} from 'phosphor-react';
import ReactCountryFlag from 'react-country-flag';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Actions from './Actions';
import DeviceListFirmwareButton from './FirmwareButton';
import DeviceTableGpsCell from './GpsCell';
import AP from './icons/AP.png';
import IOT from './icons/IOT.png';
import MESH from './icons/MESH.png';
import SWITCH from './icons/SWITCH.png';
import ProvisioningStatusCell from './ProvisioningStatusCell';
import DeviceUptimeCell from './Uptime';
import { CardBody } from 'components/Containers/Card/CardBody';
import { DataGrid } from 'components/DataTables/DataGrid';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';
import DeviceSearchBar from 'components/DeviceSearchBar';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { ConfigureModal } from 'components/Modals/ConfigureModal';
import { EventQueueModal } from 'components/Modals/EventQueueModal';
import FactoryResetModal from 'components/Modals/FactoryResetModal';
import { FirmwareUpgradeModal } from 'components/Modals/FirmwareUpgradeModal';
import { RebootModal } from 'components/Modals/RebootModal';
import { useScriptModal } from 'components/Modals/ScriptModal/useScriptModal';
import { TelemetryModal } from 'components/Modals/TelemetryModal';
import { TraceModal } from 'components/Modals/TraceModal';
import { WifiScanModal } from 'components/Modals/WifiScanModal';
import DataCell from 'components/TableCells/DataCell';
import NumberCell from 'components/TableCells/NumberCell';
import { DeviceWithStatus, useGetDeviceCount, useGetDevices } from 'hooks/Network/Devices';
import { FirmwareAgeResponse, useGetFirmwareAges } from 'hooks/Network/Firmware';

const fourDigitNumber = (v: number) => {
  if (v === 0) {
    return '0.00';
  }
  const str = v.toString();
  const fourthChar = str.charAt(3);
  if (fourthChar === '.') return `${str.slice(0, 3)}`;
  return `${str.slice(0, 4)}`;
};
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
  const scanModalProps = useDisclosure();
  const resetModalProps = useDisclosure();
  const upgradeModalProps = useDisclosure();
  const traceModalProps = useDisclosure();
  const eventQueueProps = useDisclosure();
  const telemetryModalProps = useDisclosure();
  const configureModalProps = useDisclosure();
  const rebootModalProps = useDisclosure();
  const scriptModal = useScriptModal();
  const tableController = useDataGrid({ tableSettingsId: 'gateway.devices.table' });
  const getCount = useGetDeviceCount({ enabled: true });
  const getDevices = useGetDevices({
    pageInfo: {
      limit: tableController.pageInfo.pageSize,
      index: tableController.pageInfo.pageIndex,
    },
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
  const onOpenReboot = (serial: string) => {
    setSerialNumber(serial);
    rebootModalProps.onOpen();
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
          } ${device.restrictedDevice ? `- ${t('devices.restricted')}` : ''}`}
        >
          {ICONS[device.deviceType] ?? ICONS.AP}
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
        {device.restrictedDevice && (
          <Box
            w="0.95em"
            h="0.95em"
            borderRadius="full"
            position="absolute"
            bg="blue.100"
            left={-1}
            top={0}
            borderColor="gray.200"
            borderWidth={1}
          >
            <LockSimple
              size={12}
              style={{
                color: 'black',
              }}
            />
          </Box>
        )}
      </Box>
    ),
    [],
  );

  const serialCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Link href={`#/devices/${device.serialNumber}`} fontSize="sm" my="auto" pt={1}>
        <pre>{device.serialNumber}</pre>
      </Link>
    ),
    [],
  );
  const dataCell = React.useCallback(
    (v: number) => (
      <Box textAlign="right">
        <DataCell bytes={v} showZerosAs="-" />
      </Box>
    ),
    [],
  );
  const dateCell = React.useCallback(
    (v?: number | string, hidePrefix?: boolean) =>
      v !== undefined && typeof v === 'number' && v !== 0 ? (
        <FormattedDate date={v as number} hidePrefix={hidePrefix} />
      ) : (
        '-'
      ),
    [],
  );
  const compactDateCell = React.useCallback(
    (v?: number | string, hidePrefix?: boolean) =>
      v !== undefined && typeof v === 'number' && v !== 0 ? (
        <FormattedDate date={v as number} hidePrefix={hidePrefix} isCompact />
      ) : (
        '-'
      ),
    [],
  );
  const firmwareCell = React.useCallback(
    (device: DeviceWithStatus & { age?: FirmwareAgeResponse }) => (
      <DeviceListFirmwareButton device={device} age={device.age} onOpenUpgrade={onOpenUpgradeModal} />
    ),
    [getAges],
  );
  const provCell = React.useCallback(
    (device: DeviceWithStatus) =>
      device.subscriber || device.entity || device.venue ? <ProvisioningStatusCell device={device} /> : '-',
    [],
  );
  const uptimeCell = React.useCallback((device: DeviceWithStatus) => <DeviceUptimeCell device={device} />, []);
  const localeCell = React.useCallback(
    (device: DeviceWithStatus) => (
      <Tooltip label={`${device.locale !== '' ? `${device.locale} - ` : ''}${device.ipAddress}`} placement="top">
        <Box w="100%" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
          {device.locale !== '' && device.ipAddress !== '' && (
            <ReactCountryFlag style={ICON_STYLE} countryCode={device.locale} svg />
          )}
          {`  ${device.ipAddress.length > 0 ? device.ipAddress : '-'}`}
        </Box>
      </Tooltip>
    ),
    [],
  );
  const gpsCell = React.useCallback((device: DeviceWithStatus) => <DeviceTableGpsCell device={device} />, []);
  const numberCell = React.useCallback(
    (v?: number) => (
      <NumberCell
        value={v !== undefined ? v : 0}
        showZerosAs="-"
        boxProps={{
          textAlign: 'right',
        }}
      />
    ),
    [],
  );
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
        onOpenScriptModal={scriptModal.openModal}
        onOpenRebootModal={onOpenReboot}
      />
    ),
    [],
  );

  const sanityCell = React.useCallback((device: DeviceWithStatus) => {
    if (!device.connected) return <Center>-</Center>;

    let colorScheme = 'red';
    if (device.sanity >= 80) colorScheme = 'yellow';
    if (device.sanity === 100) colorScheme = 'green';

    return (
      <Center>
        <Tag borderRadius="full" variant="subtle" colorScheme={colorScheme}>
          <TagLabel>{device.sanity}%</TagLabel>
          <TagRightIcon marginStart="0.1rem" as={colorScheme === 'green' ? Heart : HeartBreak} />
        </Tag>
      </Center>
    );
  }, []);

  const loadCell = React.useCallback((device: DeviceWithStatus) => {
    if (!device.connected) return <Center>-</Center>;

    let colorScheme = 'red';
    if (device.load <= 20) colorScheme = 'yellow';
    if (device.load <= 5) colorScheme = 'green';

    return (
      <Center>
        <Tag borderRadius="full" variant="subtle" colorScheme={colorScheme}>
          <TagLabel>{fourDigitNumber(device.load)}%</TagLabel>
          <TagRightIcon marginStart="0.1rem" as={colorScheme === 'green' ? CheckCircle : WarningCircle} />
        </Tag>
      </Center>
    );
  }, []);
  const memoryCell = React.useCallback((device: DeviceWithStatus) => {
    if (!device.connected) return <Center>-</Center>;

    let colorScheme = 'red';
    if (device.memoryUsed <= 85) colorScheme = 'yellow';
    if (device.memoryUsed <= 60) colorScheme = 'green';

    return (
      <Center>
        <Tag borderRadius="full" variant="subtle" colorScheme={colorScheme}>
          <TagLabel>{fourDigitNumber(device.memoryUsed)}%</TagLabel>
          <TagRightIcon marginStart="0.1rem" as={colorScheme === 'green' ? CheckCircle : WarningCircle} />
        </Tag>
      </Center>
    );
  }, []);
  const temperatureCell = React.useCallback((device: DeviceWithStatus) => {
    if (!device.connected || device.temperature === 0) return <Center>-</Center>;

    let colorScheme = 'red';
    if (device.temperature <= 85) colorScheme = 'yellow';
    if (device.temperature <= 75) colorScheme = 'green';

    return (
      <Center>
        <Tag borderRadius="full" variant="subtle" colorScheme={colorScheme}>
          <TagLabel>{fourDigitNumber(device.temperature)}°C</TagLabel>
          <TagRightIcon marginStart="0.1rem" as={colorScheme === 'green' ? ThermometerCold : ThermometerHot} />
        </Tag>
      </Center>
    );
  }, []);

  const columns: DataGridColumn<DeviceWithStatus>[] = React.useMemo(
    (): DataGridColumn<DeviceWithStatus>[] => [
      {
        id: 'badge',
        header: '',
        footer: '',
        accessorKey: 'badge',
        cell: (v) => badgeCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customWidth: '35px',
          alwaysShow: true,
        },
      },
      {
        id: 'serialNumber',
        header: t('inventory.serial_number'),
        footer: '',
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
        id: 'sanity',
        header: t('devices.sanity'),
        footer: '',
        cell: (v) => sanityCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          headerStyleProps: {
            textAlign: 'center',
          },
        },
      },
      {
        id: 'memory',
        header: t('analytics.memory'),
        footer: '',
        cell: (v) => memoryCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          headerStyleProps: {
            textAlign: 'center',
          },
        },
      },
      {
        id: 'load',
        header: 'Load',
        footer: '',
        cell: (v) => loadCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          headerOptions: {
            tooltip: 'CPU Load',
          },
          headerStyleProps: {
            textAlign: 'center',
          },
        },
      },
      {
        id: 'temperature',
        header: 'Temp',
        footer: '',
        cell: (v) => temperatureCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          headerOptions: {
            tooltip: t('analytics.temperature'),
          },
          columnSelectorOptions: {
            label: t('analytics.temperature'),
          },
          headerStyleProps: {
            textAlign: 'center',
          },
        },
      },
      {
        id: 'firmware',
        header: t('commands.revision'),
        footer: '',
        accessorKey: 'firmware',
        cell: (v) => firmwareCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          stopPropagation: true,
          customWidth: '50px',
        },
      },
      {
        id: 'compatible',
        header: t('common.type'),
        footer: '',
        accessorKey: 'compatible',
        enableSorting: false,
      },
      {
        id: 'IP',
        header: 'IP',
        footer: '',
        accessorKey: 'IP',
        cell: (v) => localeCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customMaxWidth: '140px',
          customWidth: '130px',
          customMinWidth: '130px',
        },
      },
      {
        id: 'provisioning',
        header: 'Provisioning',
        footer: '',
        cell: (v) => provCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          stopPropagation: true,
        },
      },
      {
        id: 'radius',
        header: 'Rad',
        footer: '',
        accessorKey: 'hasRADIUSSessions',
        cell: (v) =>
          numberCell(
            typeof v.cell.row.original.hasRADIUSSessions === 'number' ? v.cell.row.original.hasRADIUSSessions : 0,
          ),
        enableSorting: false,
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          columnSelectorOptions: {
            label: 'Radius Sessions',
          },
          headerOptions: {
            tooltip: 'Current active radius sessions',
          },
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: 'GPS',
        header: 'GPS',
        footer: '',
        cell: (v) => gpsCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customWidth: '32px',
          stopPropagation: true,
        },
      },
      {
        id: 'uptime',
        header: t('system.uptime'),
        footer: '',
        cell: (v) => uptimeCell(v.cell.row.original),
        enableSorting: false,
      },
      {
        id: 'lastContact',
        header: t('analytics.last_contact'),
        footer: '',
        accessorKey: 'lastContact',
        cell: (v) => dateCell(v.cell.row.original.lastContact),
        enableSorting: false,
      },
      {
        id: 'lastFWUpdate',
        header: t('controller.devices.last_upgrade'),
        footer: '',
        accessorKey: 'lastFWUpdate',
        cell: (v) => dateCell(v.cell.row.original.lastFWUpdate),
        enableSorting: false,
      },
      {
        id: 'rxBytes',
        header: 'Rx',
        footer: '',
        accessorKey: 'rxBytes',
        cell: (v) => dataCell(v.cell.row.original.rxBytes),
        enableSorting: false,
        meta: {
          customWidth: '50px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: 'txBytes',
        header: 'Tx',
        footer: '',
        accessorKey: 'txBytes',
        cell: (v) => dataCell(v.cell.row.original.txBytes),
        enableSorting: false,
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: '2G',
        header: '2G',
        footer: '',
        accessorKey: 'associations_2G',
        cell: (v) => numberCell(v.cell.row.original.associations_2G),
        enableSorting: false,
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: '5G',
        header: '5G',
        footer: '',
        accessorKey: 'associations_5G',
        cell: (v) => numberCell(v.cell.row.original.associations_5G),
        enableSorting: false,
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: '6G',
        header: '6G',
        footer: '',
        accessorKey: 'associations_6G',
        cell: (v) => numberCell(v.cell.row.original.associations_6G),
        enableSorting: false,
        meta: {
          customWidth: '40px',
          customMinWidth: '40px',
          headerStyleProps: {
            textAlign: 'right',
          },
        },
      },
      {
        id: 'certificateExpiryDate',
        header: 'Exp',
        footer: '',
        accessorKey: 'certificateExpiryDate',
        cell: (v) => compactDateCell(v.cell.row.original.certificateExpiryDate, true),
        enableSorting: false,
        meta: {
          columnSelectorOptions: {
            label: 'Certificate Expiry',
          },
          headerOptions: {
            tooltip: 'Certificate Expiry Date',
          },
        },
      },
      {
        id: 'actions',
        header: t('common.actions'),
        footer: '',
        accessorKey: 'actions',
        cell: (v) => actionCell(v.cell.row.original),
        enableSorting: false,
        meta: {
          customWidth: '50px',
          alwaysShow: true,
        },
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
      <CardBody p={4}>
        <Box overflowX="auto" w="100%">
          <DataGrid<DeviceWithStatus>
            controller={tableController}
            header={{
              title: `${getCount.data?.count} ${t('devices.title')}`,
              objectListed: t('devices.title'),
              leftContent: <DeviceSearchBar />,
            }}
            columns={columns}
            data={data}
            isLoading={getCount.isFetching || getDevices.isFetching}
            options={{
              count: getCount.data?.count,
              isManual: true,
              onRowClick: (device) => () => navigate(`devices/${device.serialNumber}`),
              refetch: () => {
                getDevices.refetch();
                getCount.refetch();
              },
            }}
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
      <RebootModal modalProps={rebootModalProps} serialNumber={serialNumber} />
      {scriptModal.modal}
    </>
  );
};

export default React.memo(DeviceListCard);
