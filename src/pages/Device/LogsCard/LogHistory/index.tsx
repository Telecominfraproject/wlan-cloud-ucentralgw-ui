import * as React from 'react';
import { Box, Button, Center, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HistoryDatePickers from '../DatePickers';
import DeleteLogModal from './DeleteModal';
import useDeviceLogsTable from './useDeviceLogsTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
};
const LogHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { time, setTime, getCustomLogs, getLogs, columns } = useDeviceLogsTable({ serialNumber, limit });

  const setNewTime = (start: Date, end: Date) => {
    setTime({ start, end });
  };
  const onClear = () => {
    setTime(undefined);
  };
  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const noMoreAvailable = getLogs.data !== undefined && getLogs.data.values.length < limit;

  const data = React.useMemo(() => {
    if (getCustomLogs.data) return getCustomLogs.data.values.sort((a, b) => b.recorded - a.recorded);
    if (getLogs.data) return getLogs.data.values;
    return [];
  }, [getLogs.data, getCustomLogs.data]);

  return (
    <Box>
      <Flex>
        <Spacer />
        <HStack>
          <HistoryDatePickers defaults={time} setTime={setNewTime} onClear={onClear} />
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            preference="gateway.device.logs.hiddenColumns"
          />
          <DeleteLogModal serialNumber={serialNumber} />
          <RefreshButton isCompact isFetching={getLogs.isFetching} onClick={getLogs.refetch} colorScheme="blue" />
        </HStack>
      </Flex>
      <Box overflowY="auto" h="300px">
        <DataTable
          columns={
            columns as {
              id: string;
              Header: string;
              Footer: string;
              accessor: string;
            }[]
          }
          data={data}
          isLoading={getLogs.isFetching || getCustomLogs.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.logs')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {getLogs.data !== undefined && (
          <Center mt={2} hidden={getCustomLogs.data !== undefined}>
            {!noMoreAvailable || getLogs.isFetching ? (
              <Button colorScheme="blue" onClick={raiseLimit} isLoading={getLogs.isFetching}>
                {t('controller.devices.show_more')}
              </Button>
            ) : (
              <Heading size="sm">{t('controller.devices.no_more_available')}!</Heading>
            )}
          </Center>
        )}
      </Box>
    </Box>
  );
};

export default LogHistory;
