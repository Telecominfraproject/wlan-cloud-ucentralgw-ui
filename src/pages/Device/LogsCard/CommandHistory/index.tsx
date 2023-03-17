import * as React from 'react';
import { Box, Button, Center, Heading, HStack, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import HistoryDatePickers from '../DatePickers';
import CommandResultModal from './ResultModal';
import useCommandHistoryTable from './useCommandHistoryTable';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';

type Props = {
  serialNumber: string;
};
const CommandHistory = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [limit, setLimit] = React.useState(25);
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);
  const { time, setTime, getCustomCommands, getCommands, columns, selectedCommand, detailsModalProps } =
    useCommandHistoryTable({ serialNumber, limit });

  const raiseLimit = () => {
    setLimit(limit + 25);
  };

  const setNewTime = (start: Date, end: Date) => {
    setTime({ start, end });
  };
  const onClear = () => {
    setTime(undefined);
  };

  const noMoreAvailable =
    getCustomCommands.data || (getCommands.data !== undefined && getCommands.data.commands.length < limit);

  const data = React.useMemo(() => {
    if (getCustomCommands.data) return getCustomCommands.data.commands.sort((a, b) => b.submitted - a.submitted);
    if (getCommands.data) return getCommands.data.commands;
    return [];
  }, [getCustomCommands.data, getCommands.data]);

  return (
    <Box>
      <Box textAlign="right" display="flex">
        <Spacer />
        <HStack>
          <ColumnPicker
            columns={columns as Column<unknown>[]}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            preference="gateway.device.commandshistory.hiddenColumns"
          />
          <HistoryDatePickers defaults={time} setTime={setNewTime} onClear={onClear} />
          <RefreshButton
            isCompact
            isFetching={getCommands.isFetching}
            onClick={getCommands.refetch}
            colorScheme="blue"
          />
        </HStack>
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
          data={data}
          isLoading={getCommands.isFetching || getCustomCommands.isFetching}
          hiddenColumns={hiddenColumns}
          obj={t('controller.devices.commands')}
          // @ts-ignore
          hideControls
          showAllRows
        />
        {data !== undefined && (
          <Center mt={2} hidden={getCustomCommands.data !== undefined}>
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
      <CommandResultModal command={selectedCommand} modalProps={detailsModalProps} />
    </Box>
  );
};

export default CommandHistory;
