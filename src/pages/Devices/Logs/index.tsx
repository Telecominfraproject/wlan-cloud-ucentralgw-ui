import * as React from 'react';
import { Box, Heading, Input, Select, Spacer, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useControllerStore, WebSocketMessage } from 'contexts/ControllerSocketProvider/useStore';

const LogsCard = () => {
  const { t } = useTranslation();
  const logs = useControllerStore((state) => state.allMessages);
  const [show, setShow] = React.useState<'' | 'connections'>('');
  const [serialNumber, setSerialNumber] = React.useState<string>('');

  const labels = {
    DEVICE_CONNECTION: t('common.connected'),
    DEVICE_DISCONNECTION: t('common.disconnected'),
    DEVICE_STATISTICS: t('controller.devices.new_statistics'),
    DEVICE_CONNECTIONS_STATISTICS: t('controller.dashboard.device_dashboard_refresh'),
    DEVICE_SEARCH_RESULTS: undefined,
  };

  const row = React.useCallback(
    (msg: WebSocketMessage) => {
      if (msg.type === 'NOTIFICATION') {
        return (
          <Tr key={uuid()}>
            <Td>{msg.timestamp.toLocaleTimeString()}</Td>
            <Td fontFamily="monospace" pt={2} fontSize="md">
              {msg.data?.serialNumber ?? '-'}
            </Td>
            <Td whiteSpace="nowrap">
              <Box>{labels[msg.data.type] ?? msg.data.type}</Box>
            </Td>
            <Td whiteSpace="nowrap">{JSON.stringify(msg.data)}</Td>
          </Tr>
        );
      }
      return (
        <Tr key={uuid()}>
          <Td>{msg.timestamp.toLocaleTimeString()}</Td>
          <Td fontFamily="monospace" pt={2} fontSize="md">
            -
          </Td>
          <Td whiteSpace="nowrap">
            <Box>{t('common.unknown')}</Box>
          </Td>
          <Td whiteSpace="nowrap">{JSON.stringify(msg.data)}</Td>
        </Tr>
      );
    },
    [t],
  );

  const rows = React.useMemo(() => {
    let reversed = [...logs];
    if (show === 'connections') {
      reversed = reversed.filter(
        (msg) =>
          msg.type === 'NOTIFICATION' &&
          (msg.data.type === 'DEVICE_CONNECTION' || msg.data.type === 'DEVICE_DISCONNECTION'),
      );
    }
    if (serialNumber.trim().length > 0) {
      reversed = reversed.filter(
        (msg) =>
          msg.data?.serialNumber !== undefined &&
          typeof msg.data.serialNumber === 'string' &&
          msg.data?.serialNumber.includes(serialNumber.trim()),
      );
    }
    reversed.reverse();
    return reversed.map(row);
  }, [logs, row, show, serialNumber]);

  return (
    <>
      <CardHeader px={4} pt={4}>
        <Heading size="md" my="auto" mr={2}>
          {t('controller.devices.logs')} ({rows.length})
        </Heading>
        <Input
          ml={2}
          placeholder={t('inventory.serial_number')}
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          w="160px"
        />
        <Spacer />
        <Select size="md" value={show} onChange={(e) => setShow(e.target.value as '' | 'connections')} w="200px">
          <option value="">{t('common.select_all')}</option>
          <option value="connections">{t('controller.devices.connection_changes')}</option>
        </Select>
      </CardHeader>
      <CardBody p={4}>
        <Box overflowX="auto" overflowY="auto" maxH="calc(70vh)" w="100%">
          <Table size="sm">
            <Thead>
              <Th w="100px">{t('common.time')}</Th>
              <Th w="140px">{t('inventory.serial_number')}</Th>
              <Th w="200px">{t('common.type')}</Th>
              <Th minW="100%">{t('analytics.raw_data')}</Th>
            </Thead>
            <Tbody>{rows}</Tbody>
          </Table>
        </Box>
      </CardBody>
    </>
  );
};

export default LogsCard;
