import * as React from 'react';
import { Box, Flex, Heading, Spacer } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Column } from 'models/Table';
import { ColumnPicker } from 'components/DataTables/ColumnPicker';
import { DataTable } from 'components/DataTables/DataTable';

export type ParsedRadio = {
  recorded: number;
  index: number;
  channel: number;
  channelWidth: string;
  noise: number | string;
  txPower: number | string;
  activeMs: string;
  busyMs: string;
  receiveMs: string;
  phy: string;
};

type Props = {
  data?: ParsedRadio[];
};

const WifiAnalysisRadioTable = ({ data }: Props) => {
  const { t } = useTranslation();
  const [hiddenColumns, setHiddenColumns] = React.useState<string[]>([]);

  const columns: Column<ParsedRadio>[] = React.useMemo(
    (): Column<ParsedRadio>[] => [
      {
        id: 'index',
        Header: '#',
        Footer: '',
        accessor: 'index',
        customWidth: '35px',
        alwaysShow: true,
      },
      {
        id: 'channel',
        Header: 'Ch',
        Footer: '',
        accessor: 'channel',
        customWidth: '35px',
      },
      {
        id: 'channelWidth',
        Header: t('controller.wifi.channel_width'),
        Footer: '',
        accessor: 'channelWidth',
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
        Header: t('controller.wifi.active_ms'),
        Footer: '',
        accessor: 'activeMs',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'busyMs',
        Header: t('controller.wifi.busy_ms'),
        Footer: '',
        accessor: 'busyMs',
        customWidth: '35px',
        disableSortBy: true,
      },
      {
        id: 'receiveMs',
        Header: t('controller.wifi.receive_ms'),
        Footer: '',
        accessor: 'receiveMs',
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
          {t('configurations.radios')} ({data?.length})
        </Heading>
        <Spacer />
        <ColumnPicker
          columns={columns as Column<unknown>[]}
          hiddenColumns={hiddenColumns}
          setHiddenColumns={setHiddenColumns}
          preference="gateway.device.analysis.associations.hiddenColumns"
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
          data={data ?? []}
          obj={t('controller.devices.logs')}
          // @ts-ignore
          hideControls
          showAllRows
        />
      </Box>
    </>
  );
};

export default WifiAnalysisRadioTable;
