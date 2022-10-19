import * as React from 'react';
import { Box, Button, Center, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DeleteLogModal from './DeleteModal';
import useDeviceLogsTable from './useDeviceLogsTable';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { Column } from 'models/Table';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { DataTable } from 'components/DataTables/DataTable';

type Props = {
  serialNumber: string;
};
const LogHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { getLogs, columns } = useDeviceLogsTable({ serialNumber, limit });

  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const noMoreAvailable = getLogs.data !== undefined && getLogs.data.values.length < limit;

  return (
    <Box>
      <Flex>
        <Spacer />
        <HStack>
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            preference="gateway.device.logs.hiddenColumns"
          />
          <DeleteLogModal serialNumber={serialNumber} />
          <RefreshButton isCompact isFetching={getLogs.isFetching} onClick={getLogs.refetch} ml={2} />
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
          data={getLogs.data?.values ?? []}
          isLoading={getLogs.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.logs')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {getLogs.data !== undefined && (
          <Center mt={2}>
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
