import * as React from 'react';
import { Box, IconButton, Text, useDisclosure } from '@chakra-ui/react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import DetailedLogViewModal from './DetailedLogViewModal';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { DeviceLog, useGetDeviceLogs, useGetDeviceLogsWithTimestamps } from 'hooks/Network/DeviceLogs';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
  limit: number;
  logType: 0 | 1 | 2;
};

const useDeviceLogsTable = ({ serialNumber, limit, logType }: Props) => {
  const { t } = useTranslation();
  const getLogs = useGetDeviceLogs({ serialNumber, limit, logType });
  const modalProps = useDisclosure();
  const [log, setLog] = React.useState<DeviceLog | undefined>();
  const [time, setTime] = React.useState<{ start: Date; end: Date } | undefined>();
  const getCustomLogs = useGetDeviceLogsWithTimestamps({
    serialNumber,
    start: time ? Math.floor(time.start.getTime() / 1000) : undefined,
    end: time ? Math.floor(time.end.getTime() / 1000) : undefined,
    logType,
  });

  const onOpen = React.useCallback((v: DeviceLog) => {
    setLog(v);
    modalProps.onOpen();
  }, []);

  const logCell = React.useCallback(
    (v: DeviceLog) =>
      logType === 1 ? (
        <Box display="flex">
          <IconButton
            aria-label="Open Log Details"
            onClick={() => onOpen(v)}
            colorScheme="blue"
            icon={<MagnifyingGlass size={16} />}
            size="xs"
            mr={2}
          />
          <Text my="auto" maxW="calc(20vw)" textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {v.log}
          </Text>
        </Box>
      ) : (
        v.log
      ),
    [onOpen],
  );

  const dateCell = React.useCallback(
    (v: number) => (
      <Box>
        <FormattedDate date={v} />
      </Box>
    ),
    [],
  );

  const jsonCell = React.useCallback((v: Record<string, unknown>) => <pre>{JSON.stringify(v, null, 0)}</pre>, []);

  const columns: Column<DeviceLog>[] = React.useMemo(
    (): Column<DeviceLog>[] => [
      {
        id: 'submitted',
        Header: t('common.submitted'),
        Footer: '',
        accessor: 'submitted',
        Cell: (v) => dateCell(v.cell.row.original.recorded),
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'UUID',
        Header: t('controller.devices.config_id'),
        Footer: '',
        accessor: 'UUID',
        customWidth: '35px',
        alwaysShow: true,
        disableSortBy: true,
      },
      {
        id: 'severity',
        Header: t('controller.devices.severity'),
        Footer: '',
        accessor: 'severity',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'log',
        Header: 'Log',
        Footer: '',
        accessor: 'log',
        customWidth: '35px',
        Cell: (v) => logCell(v.cell.row.original),
        disableSortBy: true,
      },
      {
        id: 'data',
        Header: t('common.details'),
        Footer: '',
        accessor: 'data',
        Cell: (v) => jsonCell(v.cell.row.original.data),
        disableSortBy: true,
      },
    ],
    [t],
  );

  return {
    columns,
    getLogs,
    getCustomLogs,
    time,
    setTime,
    modal: <DetailedLogViewModal modalProps={modalProps} log={log} />,
  };
};

export default useDeviceLogsTable;
