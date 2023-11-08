import React from 'react';
import { Box, Button, Center, Heading, IconButton, Spacer, useColorMode } from '@chakra-ui/react';
import { JsonViewer } from '@textea/json-viewer';
import { ArrowLeft } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { DeviceScanResult, ScanChannel } from 'models/Device';
import { DataGrid } from 'components/DataTables/DataGrid';
import { DataGridColumn, useDataGrid } from 'components/DataTables/DataGrid/useDataGrid';

interface Props {
  channelInfo: ScanChannel;
}

const ueCell = (ies: DeviceScanResult['ies'], setIes: (ies: DeviceScanResult['ies']) => void) => (
  <Button size="sm" colorScheme="blue" onClick={() => setIes(ies)} w="100%">
    {ies.length}
  </Button>
);

const centerIfUndefinedCell = (v?: string | number, suffix?: string) =>
  v !== undefined ? `${v}${suffix ? `${suffix}` : ''}` : <Center>-</Center>;

const ResultCard = ({ channelInfo: { channel, devices } }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const [ies, setIes] = React.useState<{ content: unknown; name: string; type: number }[] | undefined>();
  const tableController = useDataGrid({
    tableSettingsId: 'wifiscan.devices.table',
    defaultOrder: ['ssid', 'signal', 'actions'],
    defaultSortBy: [
      {
        desc: false,
        id: 'ssid',
      },
    ],
  });

  const columns: DataGridColumn<DeviceScanResult>[] = React.useMemo(
    (): DataGridColumn<DeviceScanResult>[] => [
      {
        id: 'ssid',
        header: 'SSID',
        footer: '',
        accessorKey: 'ssid',
        meta: {
          anchored: true,
          alwaysShow: true,
        },
      },
      {
        id: 'signal',
        header: 'Signal',
        footer: '',
        accessorKey: 'signal',
        cell: (v) => `${v.cell.row.original.signal} db`,
        meta: {
          anchored: true,
          customWidth: '80px',
          alwaysShow: true,
          rowContentOptions: {
            style: {
              textAlign: 'right',
            },
          },
        },
      },
      {
        id: 'station',
        header: 'UEs',
        accessorKey: 'sta_count',
        cell: (v) => centerIfUndefinedCell(v.cell.row.original.sta_count),
        meta: {
          anchored: true,
          customWidth: '40px',
          alwaysShow: true,
          rowContentOptions: {
            style: {
              textAlign: 'right',
            },
          },
        },
      },
      {
        id: 'utilization',
        header: 'Ch. Util.',
        accessorKey: 'ch_util',
        cell: (v) => centerIfUndefinedCell(v.cell.row.original.ch_util, '%'),
        meta: {
          anchored: true,
          customWidth: '60px',
          alwaysShow: true,
          headerOptions: {
            tooltip: 'Channel Utilization (%)',
          },
          rowContentOptions: {
            style: {
              textAlign: 'right',
            },
          },
        },
      },
      {
        id: 'ies',
        header: 'Ies',
        footer: '',
        accessorKey: 'actions',
        cell: (v) => ueCell(v.cell.row.original.ies ?? [], setIes),
        meta: {
          customWidth: '50px',
          isCentered: true,
          alwaysShow: true,
        },
      },
    ],
    [t],
  );

  return (
    <Card>
      <CardHeader display="flex">
        <Heading size="md" my="auto">
          {t('commands.channel')} #{channel} ({devices.length}{' '}
          {devices.length === 1 ? t('devices.one') : t('devices.title')})
        </Heading>
        <Spacer />
        {ies && (
          <IconButton
            size="sm"
            my="auto"
            aria-label={t('common.back')}
            colorScheme="blue"
            icon={<ArrowLeft size={20} />}
            onClick={() => setIes(undefined)}
          />
        )}
      </CardHeader>
      <CardBody>
        {ies ? (
          <Box w="800px">
            {ies.map(({ content, name, type }) => (
              <Box key={uuid()} my={2}>
                <Heading size="sm" mb={2} textDecor="underline">
                  {name} ({type})
                </Heading>
                <JsonViewer
                  rootName={false}
                  displayDataTypes={false}
                  enableClipboard
                  theme={colorMode === 'light' ? undefined : 'dark'}
                  value={content as object}
                  style={{ background: 'unset', display: 'unset' }}
                />
              </Box>
            ))}
          </Box>
        ) : (
          <DataGrid<DeviceScanResult>
            controller={tableController}
            header={{
              title: '',
              objectListed: t('devices.title'),
            }}
            columns={columns}
            data={devices}
            options={{
              count: devices.length,
              onRowClick: (device) => () => setIes(device.ies ?? []),
              hideTablePreferences: true,
              isHidingControls: true,
              minimumHeight: '0px',
              hideTableTitleRow: true,
            }}
          />
        )}
      </CardBody>
    </Card>
  );
};

export default ResultCard;
