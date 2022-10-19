import * as React from 'react';
import {
  Box,
  Heading,
  HStack,
  IconButton,
  Select,
  Spacer,
  Switch,
  Text,
  Tooltip,
  useBoolean,
  useDisclosure,
} from '@chakra-ui/react';
import { MagnifyingGlass } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import FirmwareDetailsModal from './Modal';
import UriCell from './UriCell';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { DataTable } from 'components/DataTables/DataTable';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { LoadingOverlay } from 'components/LoadingOverlay';
import DataCell from 'components/TableCells/DataCell';
import { getRevision } from 'helpers/stringHelper';
import { useGetDeviceTypes, useGetFirmwareDeviceType } from 'hooks/Network/Firmware';
import { Firmware } from 'models/Firmware';
import { Column } from 'models/Table';

const FirmwareListTable = () => {
  const { t } = useTranslation();
  const [firmware, setFirmware] = React.useState<Firmware | undefined>();
  const [showDevFirmware, { toggle }] = useBoolean();
  const modalProps = useDisclosure();
  const [deviceType, setDeviceType] = React.useState<string | undefined>();
  const getDeviceTypes = useGetDeviceTypes();
  const getFirmware = useGetFirmwareDeviceType({ deviceType });

  const handleViewDetailsClick = (firmw: Firmware) => () => {
    setFirmware(firmw);
    modalProps.onOpen();
  };

  const dateCell = React.useCallback((v: number) => <FormattedDate date={v} />, []);
  const dataCell = React.useCallback(
    (v: number) => (
      <Box textAlign="right">
        <DataCell bytes={v} />
      </Box>
    ),
    [],
  );
  const revisionCell = React.useCallback((v: string) => getRevision(v), []);
  const uriCell = React.useCallback((v: string) => <UriCell uri={v} />, []);
  const actionCell = React.useCallback(
    (firmw: Firmware) => (
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleViewDetailsClick(firmw)}
        />
      </Tooltip>
    ),
    [],
  );

  const columns: Column<Firmware>[] = React.useMemo(
    () => [
      {
        id: 'imageDate',
        Header: t('commands.image_date'),
        Footer: '',
        accessor: 'imageDate',
        Cell: ({ cell }) => dateCell(cell.row.original.imageDate),
        customWidth: '150px',
      },
      {
        id: 'size',
        Header: t('common.size'),
        Footer: '',
        accessor: 'size',
        Cell: ({ cell }) => dataCell(cell.row.original.size),
        customWidth: '50px',
      },
      {
        id: 'revision',
        Header: t('commands.revision'),
        Footer: '',
        accessor: 'revision',
        Cell: ({ cell }) => revisionCell(cell.row.original.revision),
        customWidth: '150px',
        alwaysShow: true,
      },
      {
        id: 'uri',
        Header: 'URI',
        Footer: '',
        Cell: ({ cell }) => uriCell(cell.row.original.uri),
        accessor: 'uri',
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
    [dateCell],
  );

  React.useEffect(() => {
    if (deviceType === undefined && getDeviceTypes.data && getDeviceTypes.data.deviceTypes[0]) {
      setDeviceType(getDeviceTypes.data.deviceTypes[0]);
    }
  }, [deviceType, getDeviceTypes]);

  return (
    <>
      <CardHeader px={4} pt={4}>
        <Heading size="md" my="auto" mr={2}>
          {t('analytics.firmware')} {getFirmware.data ? `(${getFirmware.data.length})` : ''}
        </Heading>
        <Spacer />
        <HStack>
          <Box>
            <Select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
              {getDeviceTypes.data?.deviceTypes.map((devType) => (
                <option key={uuid()} value={devType}>
                  {devType}
                </option>
              ))}
            </Select>
          </Box>
          <Text>{t('controller.firmware.show_dev_releases')}</Text>
          <Switch isChecked={showDevFirmware} onChange={toggle} size="lg" />
          <RefreshButton
            onClick={() => {
              getDeviceTypes.refetch();
              getFirmware.refetch();
            }}
            isCompact
            isFetching={getDeviceTypes.isFetching || getFirmware.isFetching}
          />
        </HStack>
      </CardHeader>
      <CardBody p={4}>
        <Box overflowX="auto" w="100%">
          <LoadingOverlay isLoading={getDeviceTypes.isFetching || getFirmware.isFetching}>
            <DataTable
              columns={columns as Column<object>[]}
              saveSettingsId="firmware.table"
              data={getFirmware.data?.filter((firmw) => showDevFirmware || !firmw.revision.includes('devel')) ?? []}
              obj={t('analytics.firmware')}
              minHeight="200px"
              sortBy={[{ id: 'imageDate', desc: true }]}
            />
          </LoadingOverlay>
        </Box>
      </CardBody>
      <FirmwareDetailsModal firmware={firmware} modalProps={modalProps} />
    </>
  );
};

export default FirmwareListTable;
