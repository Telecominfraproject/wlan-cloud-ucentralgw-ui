import * as React from 'react';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { Column } from 'models/Table';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { DataTable } from 'components/DataTables/DataTable';
import { Box, Button, Center, Flex, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import DeleteHealthChecksModal from './DeleteModal';
import useHealthCheckTable from './useHealthCheckTable';

type Props = {
  serialNumber: string;
};
const HealthCheckHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { getHealthChecks, columns } = useHealthCheckTable({ serialNumber, limit });

  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const noMoreAvailable = getHealthChecks.data !== undefined && getHealthChecks.data.values.length < limit;

  return (
    <Box>
      <Flex>
        <Spacer />
        <HStack>
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            preference="gateway.device.healthchecks.hiddenColumns"
          />
          <DeleteHealthChecksModal serialNumber={serialNumber} />
          <RefreshButton isCompact isFetching={getHealthChecks.isFetching} onClick={getHealthChecks.refetch} ml={2} />
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
          data={getHealthChecks.data?.values ?? []}
          isLoading={getHealthChecks.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.healthchecks')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {getHealthChecks.data !== undefined && (
          <Center mt={2}>
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
