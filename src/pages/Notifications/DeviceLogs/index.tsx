import * as React from 'react';
import { Box, Button, Flex, HStack, Select, Spacer, Table, Text, Th, Thead, Tr } from '@chakra-ui/react';
import { Download } from 'phosphor-react';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';
import ReactVirtualizedAutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeList as List } from 'react-window';
import DeviceLogsSearchBar from './DeviceLogsSearchBar';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import ShownLogsDropdown from 'components/ShownLogsDropdown';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import { dateForFilename } from 'helpers/dateFormatting';

const LogsCard = () => {
  const { t } = useTranslation();
  const { availableLogTypes, hiddenLogIds, setHiddenLogIds, logs } = useControllerStore((state) => ({
    logs: state.allMessages,
    availableLogTypes: state.availableLogTypes,
    hiddenLogIds: state.hiddenLogIds,
    setHiddenLogIds: state.setHiddenLogIds,
  }));
  const [show, setShow] = React.useState<'' | 'connections' | 'statistics' | 'global_statistics'>('');
  const [serialNumber, setSerialNumber] = React.useState<string>('');

  const onSerialSelect = React.useCallback((serial: string) => setSerialNumber(serial), []);

  const labels = {
    DEVICE_CONNECTION: t('common.connected'),
    DEVICE_DISCONNECTION: t('common.disconnected'),
    DEVICE_STATISTICS: t('controller.devices.new_statistics'),
    DEVICE_CONNECTIONS_STATISTICS: t('controller.dashboard.device_dashboard_refresh'),
    DEVICE_SEARCH_RESULTS: undefined,
  };

  const data = React.useMemo(() => {
    let arr = logs.filter(
      ({ data: d }) =>
        d.type === 'DEVICE_CONNECTION' || d.type === 'DEVICE_DISCONNECTION' || d.type === 'DEVICE_STATISTICS',
    );
    if (show === 'connections') {
      arr = arr.filter(
        (msg) =>
          msg.type === 'NOTIFICATION' &&
          (msg.data.type === 'DEVICE_CONNECTION' || msg.data.type === 'DEVICE_DISCONNECTION'),
      );
    } else if (show === 'statistics') {
      arr = arr.filter((msg) => msg.type === 'NOTIFICATION' && msg.data.type === 'DEVICE_STATISTICS');
    } else if (show === 'global_statistics') {
      arr = arr.filter((msg) => msg.type === 'NOTIFICATION' && msg.data.type === 'DEVICE_CONNECTIONS_STATISTICS');
    }
    if (serialNumber.trim().length > 0) {
      arr = arr.filter(
        (msg) =>
          msg.data?.serialNumber !== undefined &&
          typeof msg.data.serialNumber === 'string' &&
          msg.data?.serialNumber.includes(serialNumber.trim()),
      );
    }

    return arr.reverse();
  }, [logs, show, serialNumber]);

  type RowProps = { index: number; style: React.CSSProperties };
  const Row = React.useCallback(
    ({ index, style }: RowProps) => {
      const msg = data[index];
      if (msg) {
        if (msg.type === 'NOTIFICATION' && msg.data.serialNumber) {
          return (
            <Box style={style}>
              <Flex w="100%">
                <Box flex="0 1 110px">
                  <Text>{msg.timestamp.toLocaleTimeString()}</Text>
                </Box>
                <Box flex="0 1 130px" textAlign="left">
                  <Text fontFamily="mono">{msg.data?.serialNumber ?? '-'}</Text>
                </Box>
                <Box flex="0 1 140px">
                  <Text>{labels[msg.data.type] ?? msg.data.type}</Text>
                </Box>
                <Box textAlign="left" w="calc(100% - 80px - 120px - 140px - 60px)">
                  <Text textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
                    {JSON.stringify(msg.data)}
                  </Text>
                </Box>
              </Flex>
            </Box>
          );
        }
      }
      return null;
    },
    [t, data],
  );

  const downloadableLogs = React.useMemo(
    () =>
      data.map((msg) => ({
        timestamp: msg.timestamp.toLocaleString(),
        serialNumber: msg.data?.serialNumber ?? '-',
        type: labels[msg.data?.type] ?? msg.data.type,
        data: JSON.stringify(msg.data),
      })),
    [data],
  );

  return (
    <>
      <CardHeader px={4} pt={4}>
        <DeviceLogsSearchBar onSearchSelect={onSerialSelect} />
        <Spacer />
        <HStack spacing={2}>
          <ShownLogsDropdown
            availableLogTypes={availableLogTypes}
            setHiddenLogIds={setHiddenLogIds}
            hiddenLogIds={hiddenLogIds}
          />
          <Select size="md" value={show} onChange={(e) => setShow(e.target.value as '' | 'connections')} w="200px">
            <option value="">{t('common.select_all')}</option>
            <option value="connections">{t('controller.devices.connection_changes')}</option>
            <option value="statistics">{t('logs.device_statistics')}</option>
            <option value="global_statistics">{t('logs.global_connections')}</option>
          </Select>

          <CSVLink
            filename={`logs_${dateForFilename(new Date().getTime() / 1000)}.csv`}
            data={downloadableLogs as object[]}
          >
            <Button onClick={() => {}} colorScheme="blue" leftIcon={<Download />}>
              {t('logs.export')}
            </Button>
          </CSVLink>
        </HStack>
      </CardHeader>
      <CardBody p={4}>
        <Box overflowX="auto" w="100%">
          <Table size="sm">
            <Thead>
              <Tr>
                <Th w="110px">{t('common.time')}</Th>
                <Th w="150px">{t('inventory.serial_number')}</Th>
                <Th w="120px" pl={0}>
                  {t('common.type')}
                </Th>
                <Th>{t('analytics.raw_data')}</Th>
              </Tr>
            </Thead>
          </Table>
          <Box ml={4} h="calc(70vh)">
            <ReactVirtualizedAutoSizer>
              {({ height, width }) => (
                <List height={height} width={width} itemCount={data.length} itemSize={35}>
                  {Row}
                </List>
              )}
            </ReactVirtualizedAutoSizer>
          </Box>
        </Box>
      </CardBody>
    </>
  );
};

export default LogsCard;
