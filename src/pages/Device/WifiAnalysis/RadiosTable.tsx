import * as React from 'react';
import { Box, Flex, Heading, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';
import { Column } from 'models/Table';

export type ParsedRadio = {
  recorded: number;
  band?: string;
  deductedBand: string;
  index: number;
  channel: number;
  channelWidth: string;
  noise: number | string;
  txPower: number | string;
  activeMs: string;
  busyMs: string;
  receiveMs: string;
  sendMs: string;
  phy: string;
  frequency: string;
  temperature: string;
};

type Props = {
  data?: ParsedRadio[];
  isSingle?: boolean;
};

const WifiAnalysisRadioTable = ({ data, isSingle }: Props) => {
  const { t } = useTranslation();
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);

  const indexCell = React.useCallback((radio: ParsedRadio) => radio.band ?? radio.deductedBand, []);

  const columns: Column<ParsedRadio>[] = React.useMemo(
    (): Column<ParsedRadio>[] => [
      {
        id: 'index',
        Header: '',
        Footer: '',
        accessor: 'index',
        Cell: ({ cell }) => indexCell(cell.row.original),
        customWidth: '35px',
        alwaysShow: true,
        disableSortBy: true,
      },
      {
        id: 'channel',
        Header: 'Ch.',
        Footer: '',
        accessor: 'channel',
        customWidth: '35px',
      },
      {
        id: 'channelWidth',
        Header: 'Ch. W',
        Footer: '',
        accessor: 'channelWidth',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'tx-power',
        Header: 'Tx Pow.',
        Footer: '',
        accessor: 'txPower',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'noise',
        Header: t('controller.wifi.noise'),
        Footer: '',
        accessor: 'noise',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'activeMs',
        Header: 'Active (ms)',
        Footer: '',
        accessor: 'activeMs',
        customWidth: '105px',
        disableSortBy: true,
      },
      {
        id: 'busyMs',
        Header: 'Busy (ms)',
        Footer: '',
        accessor: 'busyMs',
        customWidth: '105px',
        disableSortBy: true,
      },
      {
        id: 'receiveMs',
        Header: 'Receive (ms)',
        Footer: '',
        accessor: 'receiveMs',
        customWidth: '105px',
        disableSortBy: true,
      },
      {
        id: 'sendMs',
        Header: 'Send (ms)',
        Footer: '',
        accessor: 'sendMs',
        customWidth: '105px',
        disableSortBy: true,
      },
      {
        id: 'temperature',
        Header: 'Temp.',
        Footer: '',
        accessor: 'temperature',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'frequency',
        Header: 'Frequency',
        Footer: '',
        accessor: 'frequency',
        customWidth: '35px',
        disableSortBy: true,
      },
    ],
    [t],
  );

  return (
    <>
      <Flex>
        <Heading size="sm" mt={2} my="auto">
          {isSingle ? 'Radio' : `${t('configurations.radios')} (${data?.length})`}
        </Heading>
        <Spacer />
        <ColumnPicker
          columns={columns as Column<unknown>[]}
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          preference="gateway.device.analysis.radio.hiddenColumns"
          size="sm"
        />
      </Flex>
      <Box overflowX="auto" w="100%">
        <DataTable
          columns={
            columns as {
              id: string;
              Header: string;
              Footer: string;
              accessor: string;
            }[]
          }
          hiddenColumns={hiddenColumns}
          data={data ?? []}
          obj={t('controller.devices.logs')}
          sortBy={[{ id: 'index', desc: true }]}
          // @ts-ignore
          hideControls
          showAllRows
        />
      </Box>
    </>
  );
};

export default WifiAnalysisRadioTable;
