import * as React from 'react';
import { Box, Center, Flex, Heading, HStack, Select, Spacer, Spinner } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import StatisticsCardDatePickers from './DatePickers';
import InterfaceChart from './InterfaceChart';
import DeviceMemoryChart from './MemoryChart';
import ViewLastStatsModal from './ViewLastStatsModal';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { LoadingOverlay } from 'components/LoadingOverlay';
import {
  DeviceStatistics,
  useGetDeviceStatsLatestHour,
  useGetDeviceStatsWithTimestamps,
} from 'hooks/Network/Statistics';

const extractMemory = (stat: DeviceStatistics) => {
  let used: number | undefined;
  if (stat.unit && stat.unit.memory) {
    used = stat.unit.memory.total - stat.unit.memory.free;
  }
  return { ...stat.unit?.memory, used };
};

type Props = {
  serialNumber: string;
};

const DeviceStatisticsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const [time, setTime] = React.useState<{ start: Date; end: Date } | undefined>();
  const [selected, setSelected] = React.useState('memory');
  const getStats = useGetDeviceStatsLatestHour({ serialNumber, limit: 10000 });
  const getCustomStats = useGetDeviceStatsWithTimestamps({
    serialNumber,
    limit: 10000,
    start: time ? Math.floor(time.start.getTime() / 1000) : undefined,
    end: time ? Math.floor(time.end.getTime() / 1000) : undefined,
  });

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(event.target.value);
  };

  const setNewTime = (start: Date, end: Date) => {
    setTime({ start, end });
  };
  const onClear = () => {
    setTime(undefined);
  };

  const parsedData = React.useMemo(() => {
    if (!getStats.data && !getCustomStats.data) return undefined;

    const data: Record<string, { tx: number[]; rx: number[]; recorded: number[]; maxRx: number; maxTx: number }> = {};
    const memoryData = {
      used: [] as number[],
      buffered: [] as number[],
      cached: [] as number[],
      free: [] as number[],
      total: [] as number[],
      recorded: [] as number[],
    };
    const previousRx: { [key: string]: number } = {};
    const previousTx: { [key: string]: number } = {};

    const dataToLoop = getCustomStats.data ?? getStats.data;

    for (const [index, stat] of dataToLoop ? dataToLoop.data.entries() : []) {
      if (index === 0) {
        let updated = false;
        for (const inter of stat.data.interfaces ?? []) {
          if (!updated && selected === 'memory') {
            updated = true;
            setSelected(inter.name);
          }
          previousRx[inter.name] = inter.counters?.rx_bytes ?? 0;
          previousTx[inter.name] = inter.counters?.tx_bytes ?? 0;
        }
      } else {
        const newMem = extractMemory(stat.data);
        memoryData.used.push(newMem.used ?? 0);
        memoryData.buffered.push(newMem.buffered ?? 0);
        memoryData.cached.push(newMem.cached ?? 0);
        memoryData.free.push(newMem.free ?? 0);
        memoryData.total.push(newMem.total ?? 0);
        memoryData.recorded.push(stat.recorded);

        for (const inter of stat.data.interfaces ?? []) {
          const rx = inter.counters?.rx_bytes ?? 0;
          const tx = inter.counters?.tx_bytes ?? 0;
          let rxDelta = rx - (previousRx[inter.name] ?? 0);
          if (rxDelta < 0) rxDelta = 0;
          let txDelta = tx - (previousTx[inter.name] ?? 0);
          if (txDelta < 0) txDelta = 0;
          if (data[inter.name] === undefined)
            data[inter.name] = {
              rx: [rxDelta],
              tx: [txDelta],
              recorded: [stat.recorded],
              maxTx: txDelta,
              maxRx: rxDelta,
            };
          else {
            data[inter.name]?.rx.push(rxDelta);
            data[inter.name]?.tx.push(txDelta);
            data[inter.name]?.recorded.push(stat.recorded);
            // @ts-ignore
            if (data[inter.name] !== undefined && txDelta > data[inter.name].maxTx) data[inter.name].maxTx = txDelta;
            // @ts-ignore
            if (data[inter.name] !== undefined && rxDelta > data[inter.name].maxRx) data[inter.name].maxRx = rxDelta;
          }
          previousRx[inter.name] = rx;
          previousTx[inter.name] = tx;
        }
      }
    }

    return {
      interfaces: data,
      memory: memoryData,
    };
  }, [getStats.data, getCustomStats.data]);

  const interfaces = React.useMemo(() => {
    if (!parsedData) return undefined;

    return Object.entries(parsedData.interfaces).map(([name, data]) => (
      <Box hidden={name !== selected} key={uuid()}>
        <InterfaceChart data={data} />
      </Box>
    ));
  }, [parsedData, selected]);
  const memory = React.useMemo(() => {
    if (!parsedData) return undefined;

    return <DeviceMemoryChart data={parsedData.memory} />;
  }, [parsedData]);

  const isLoading = React.useMemo(() => {
    if (!time && getStats?.isFetching) return true;
    if (time && getCustomStats.isFetching) return true;

    return false;
  }, [getStats, getCustomStats, time]);

  return (
    <Card mb={4}>
      <CardHeader display="block">
        <Flex>
          <Heading size="md">{t('configurations.statistics')}</Heading>
          <Spacer />
          <HStack>
            <ViewLastStatsModal serialNumber={serialNumber} />
            <StatisticsCardDatePickers defaults={time} setTime={setNewTime} onClear={onClear} />
            <Select value={selected} onChange={onChange}>
              {parsedData?.interfaces
                ? Object.keys(parsedData.interfaces).map((v) => (
                    <option value={v} key={uuid()}>
                      {v}
                    </option>
                  ))
                : null}
              <option value="memory">{t('statistics.memory')}</option>
            </Select>
            <RefreshButton
              size="sm"
              onClick={getStats.refetch}
              isCompact
              isFetching={getStats.isFetching}
              // @ts-ignore
              colorScheme="blue"
            />
          </HStack>
        </Flex>
      </CardHeader>
      <CardBody display="block" mb={2} minH="230px">
        {time && (
          <Flex>
            <Heading size="sm">
              {t('controller.devices.from_to', {
                from: `${time.start.toLocaleDateString()} ${time.start.toLocaleTimeString()}`,
                to: `${time.end.toLocaleDateString()} ${time.end.toLocaleTimeString()}`,
              })}
            </Heading>
          </Flex>
        )}
        {!getStats?.data && isLoading ? (
          <Center my="auto">
            <Spinner size="xl" mt="100px" />
          </Center>
        ) : (
          <LoadingOverlay isLoading={isLoading}>
            <Box>
              {selected === 'memory' && memory}
              {interfaces}
            </Box>
          </LoadingOverlay>
        )}
      </CardBody>
    </Card>
  );
};

export default DeviceStatisticsCard;
