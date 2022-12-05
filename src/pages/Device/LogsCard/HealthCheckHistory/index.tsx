import * as React from 'react';
import { Box, Button, Center, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HistoryDatePickers from '../DatePickers';
import DeleteHealthChecksModal from './DeleteModal';
import useHealthCheckTable from './useHealthCheckTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
};
const HealthCheckHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { time, setTime, getCustomHealthChecks, getHealthChecks, columns } = useHealthCheckTable({
    serialNumber,
    limit,
  });

  const setNewTime = (start: Date, end: Date) => {
    setTime({ start, end });
  };
  const onClear = () => {
    setTime(undefined);
  };
  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const noMoreAvailable = getHealthChecks.data !== undefined && getHealthChecks.data.values.length < limit;

  const data = React.useMemo(() => {
    if (getCustomHealthChecks.data) return getCustomHealthChecks.data.values.sort((a, b) => b.recorded - a.recorded);
    if (getHealthChecks.data) return getHealthChecks.data.values;
    return [];
  }, [getHealthChecks.data, getCustomHealthChecks.data]);

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
            preference="gateway.device.healthchecks.hiddenColumns"
          />
          <DeleteHealthChecksModal serialNumber={serialNumber} />
          <RefreshButton
            isCompact
            isFetching={getHealthChecks.isFetching || getCustomHealthChecks.isFetching}
            onClick={getHealthChecks.refetch}
            ml={2}
            colorScheme="blue"
          />
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
          isLoading={getHealthChecks.isFetching || getCustomHealthChecks.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.healthchecks')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {getHealthChecks.data !== undefined && (
          <Center mt={2} hidden={getCustomHealthChecks.data !== undefined}>
            {!noMoreAvailable || getHealthChecks.isFetching ? (
              <Button colorScheme="blue" onClick={raiseLimit} isLoading={getHealthChecks.isFetching}>
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

export default HealthCheckHistory;
