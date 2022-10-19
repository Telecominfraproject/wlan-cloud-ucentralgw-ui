import * as React from 'react';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { Column } from 'models/Table';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { DataTable } from 'components/DataTables/DataTable';
import { Box, Button, Center, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import CommandDetailsModal from './Modal';
import useCommandHistoryTable from './useCommandHistoryTable';

type Props = {
  serialNumber: string;
};
const CommandHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { getCommands, columns, selectedCommand, detailsModalProps } = useCommandHistoryTable({ serialNumber, limit });

  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const noMoreAvailable = getCommands.data !== undefined && getCommands.data.commands.length < limit;

  return (
    <Box>
      <Box textAlign="right">
        <ColumnPicker
          columns={columns as Column<unknown>[]}
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          preference="gateway.device.commandshistory.hiddenColumns"
        />
        <RefreshButton isCompact isFetching={getCommands.isFetching} onClick={getCommands.refetch} ml={2} />
      </Box>
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
          data={getCommands.data?.commands ?? []}
          isLoading={getCommands.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.commands')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {getCommands.data !== undefined && (
          <Center mt={2}>
            {!noMoreAvailable || getCommands.isFetching ? (
              <Button colorScheme="blue" onClick={raiseLimit} isLoading={getCommands.isFetching}>
                {t('controller.devices.show_more')}
              </Button>
            ) : (
              <Heading size="sm">{t('controller.devices.no_more_available')}!</Heading>
            )}
          </Center>
        )}
      </Box>
      <CommandDetailsModal command={selectedCommand} modalProps={detailsModalProps} />
    </Box>
  );
};

export default CommandHistory;
