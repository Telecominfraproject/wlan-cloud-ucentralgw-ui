import React from 'react';
import { DeviceStatistics, useGetDeviceNewestStats, useGetDeviceStatsWithTimestamps } from 'hooks/Network/Statistics';

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

export const useStatisticsCard = ({ serialNumber }: Props) => {
  const [selected, setSelected] = React.useState('memory');
  const [progress, setProgress] = React.useState(0);
  const [hasSelectedNew, setHasSelectedNew] = React.useState(false);
  const [time, setTime] = React.useState<{ start: Date; end: Date } | undefined>();
  const onProgressChange = React.useCallback((newProgress: number) => {
    setProgress(newProgress);
  }, []);
  const getStats = useGetDeviceNewestStats({ serialNumber, limit: 30 });
  const getCustomStats = useGetDeviceStatsWithTimestamps({
    serialNumber,
    start: time ? Math.floor(time.start.getTime() / 1000) : undefined,
    end: time ? Math.floor(time.end.getTime() / 1000) : undefined,
    setProgress: onProgressChange,
  });

  const onSelectInterface = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setHasSelectedNew(true);
    setSelected(event.target.value);
  };

  const parsedData = React.useMemo(() => {
    if (!getStats.data && !getCustomStats.data) return undefined;

    const data: Record<
      string,
      { tx: number[]; rx: number[]; recorded: number[]; maxRx: number; maxTx: number; removed?: boolean }
    > = {};
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

    let dataToLoop = getCustomStats.data ?? getStats.data?.data;
    if (dataToLoop && !getCustomStats.data) {
      dataToLoop = [...dataToLoop].reverse();
    }

    for (const [index, stat] of dataToLoop ? dataToLoop.entries() : []) {
      if (index === 0) {
        let updated = false;
        for (const inter of stat.data.interfaces ?? []) {
          if (!hasSelectedNew && !updated && selected === 'memory') {
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
          const isInterUpstream = inter.name?.substring(0, 2) === 'up';
          let rx = inter.counters?.rx_bytes ?? 0;
          let tx = inter.counters?.tx_bytes ?? 0;

          if (inter['counters-aggregate']) {
            rx = inter['counters-aggregate'].rx_bytes;
            tx = inter['counters-aggregate'].tx_bytes;
          } else if (isInterUpstream) {
            for (const ssid of inter.ssids ?? []) {
              rx += ssid.counters?.rx_bytes ?? 0;
              tx += ssid.counters?.tx_bytes ?? 0;
            }
          }

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
            if (data[inter.name] && !data[inter.name]?.removed && data[inter.name]?.recorded.length === 1) {
              data[inter.name]?.tx.shift();
              data[inter.name]?.rx.shift();
              data[inter.name]?.recorded.shift();
              // @ts-ignore
              data[inter.name].maxRx = rxDelta;
              // @ts-ignore
              data[inter.name].maxTx = txDelta;
              // @ts-ignore
              data[inter.name].removed = true;
            }

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

  const refresh = React.useCallback(() => {
    if (!time) getStats.refetch();
    else getCustomStats.refetch();
  }, [time]);

  const isLoading = React.useMemo(() => {
    if (!time && getStats?.isFetching) return { isLoading: true };
    if (time && getCustomStats.isFetching) return { isLoading: true, progress };

    return { isLoading: false };
  }, [getStats, getCustomStats, time, progress]);

  return React.useMemo(
    () => ({
      parsedData,
      isLoading,
      onSelectInterface,
      selected,
      time,
      setTime,
      refresh,
    }),
    [parsedData, isLoading, selected, time],
  );
};
