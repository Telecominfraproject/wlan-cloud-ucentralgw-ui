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

    try {
      const data: Record<
        string,
        {
          tx: number[];
          rx: number[];
          packetsRx: number[];
          packetsTx: number[];
          recorded: number[];
          maxRx: number;
          maxTx: number;
          maxPacketsRx: number;
          maxPacketsTx: number;
          removed?: boolean;
        }
      > = {};
      const memoryData = {
        used: [] as number[],
        buffered: [] as number[],
        cached: [] as number[],
        free: [] as number[],
        total: [] as number[],
        recorded: [] as number[],
      };
      const vlanData: Record<
        string,
        {
          tx: number[];
          rx: number[];
          packetsRx: number[];
          packetsTx: number[];
          recorded: number[];
          maxRx: number;
          maxTx: number;
          maxPacketsRx: number;
          maxPacketsTx: number;
          removed?: boolean;
        }
      > = {};
      const previousRx: { [key: string]: number } = {};
      const previousTx: { [key: string]: number } = {};
      const previousPacketsRx: { [key: string]: number } = {};
      const previousPacketsTx: { [key: string]: number } = {};
      const previousVlanRx: { [key: string]: number } = {};
      const previousVlanTx: { [key: string]: number } = {};
      const previousVlanPacketsRx: { [key: string]: number } = {};
      const previousVlanPacketsTx: { [key: string]: number } = {};

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
            previousPacketsRx[inter.name] = inter.counters?.rx_packets ?? 0;
            previousPacketsTx[inter.name] = inter.counters?.tx_packets ?? 0;
          }
          for (const vlan of stat.data.dynamic_vlans ?? []) {
            previousVlanRx[vlan.vid] = vlan.rx_bytes ?? 0;
            previousVlanTx[vlan.vid] = vlan.tx_bytes ?? 0;
            previousVlanPacketsRx[vlan.vid] = vlan.rx_packets ?? 0;
            previousVlanPacketsTx[vlan.vid] = vlan.tx_packets ?? 0;
          }
        } else {
          // Memory
          const newMem = extractMemory(stat.data);
          memoryData.used.push(newMem.used ?? 0);
          memoryData.buffered.push(newMem.buffered ?? 0);
          memoryData.cached.push(newMem.cached ?? 0);
          memoryData.free.push(newMem.free ?? 0);
          memoryData.total.push(newMem.total ?? 0);
          memoryData.recorded.push(stat.recorded);

          // Vlans
          for (const vlan of stat.data.dynamic_vlans ?? []) {
            const rx = vlan.rx_bytes ?? 0;
            const tx = vlan.tx_bytes ?? 0;
            const packetsRx = vlan.rx_packets ?? 0;
            const packetsTx = vlan?.tx_packets ?? 0;

            let rxDelta = rx - (previousVlanRx[vlan.vid] ?? 0);
            if (rxDelta < 0) rxDelta = 0;
            let txDelta = tx - (previousVlanTx[vlan.vid] ?? 0);
            if (txDelta < 0) txDelta = 0;
            let packetsRxDelta = packetsRx - (previousVlanPacketsRx[vlan.vid] ?? 0);
            if (packetsRxDelta < 0) packetsRxDelta = 0;
            let packetsTxDelta = packetsTx - (previousVlanPacketsTx[vlan.vid] ?? 0);
            if (packetsTxDelta < 0) packetsTxDelta = 0;

            if (vlanData[vlan.vid] === undefined)
              vlanData[vlan.vid] = {
                rx: [rxDelta],
                tx: [txDelta],
                packetsRx: [packetsRxDelta],
                packetsTx: [packetsTxDelta],
                recorded: [stat.recorded],
                maxTx: 0,
                maxRx: 0,
                maxPacketsRx: 0,
                maxPacketsTx: 0,
              };
            else {
              if (vlanData[vlan.vid] && !vlanData[vlan.vid]?.removed && vlanData[vlan.vid]?.recorded.length === 1) {
                vlanData[vlan.vid]?.tx.shift();
                vlanData[vlan.vid]?.rx.shift();
                vlanData[vlan.vid]?.packetsTx.shift();
                vlanData[vlan.vid]?.packetsRx.shift();
                vlanData[vlan.vid]?.recorded.shift();
                // @ts-ignore
                vlanData[vlan.vid].maxRx = rxDelta;
                // @ts-ignore
                vlanData[vlan.vid].maxTx = txDelta;
                // @ts-ignore
                vlanData[vlan.vid].removed = true;
              }

              vlanData[vlan.vid]?.rx.push(rxDelta);
              vlanData[vlan.vid]?.tx.push(txDelta);
              vlanData[vlan.vid]?.packetsRx.push(packetsRxDelta);
              vlanData[vlan.vid]?.packetsTx.push(packetsTxDelta);
              vlanData[vlan.vid]?.recorded.push(stat.recorded);
              // @ts-ignore
              if (vlanData[vlan.vid] !== undefined && txDelta > vlanData[vlan.vid].maxTx) {
                // @ts-ignore
                vlanData[vlan.vid].maxTx = txDelta;
              }
              // @ts-ignore
              if (vlanData[vlan.vid] !== undefined && rxDelta > vlanData[vlan.vid].maxRx) {
                // @ts-ignore
                vlanData[vlan.vid].maxRx = rxDelta;
              }
              // @ts-ignore
              if (vlanData[vlan.vid] !== undefined && packetsTxDelta > vlanData[vlan.vid].maxPacketsTx) {
                // @ts-ignore
                vlanData[vlan.vid].maxPacketsTx = packetsTxDelta;
              }
              // @ts-ignore
              if (vlanData[vlan.vid] !== undefined && packetsRxDelta > vlanData[vlan.vid].maxPacketsRx) {
                // @ts-ignore
                vlanData[vlan.vid].maxPacketsRx = packetsRxDelta;
              }
            }
            previousVlanRx[vlan.vid] = rx;
            previousVlanTx[vlan.vid] = tx;
            previousVlanPacketsRx[vlan.vid] = packetsRx;
            previousVlanPacketsTx[vlan.vid] = packetsTx;
          }

          // Interfaces
          for (const inter of stat.data.interfaces ?? []) {
            const isInterUpstream = inter.name?.substring(0, 2) === 'up';
            let rx = inter.counters?.rx_bytes ?? 0;
            let tx = inter.counters?.tx_bytes ?? 0;
            let packetsRx = inter.counters?.rx_packets ?? 0;
            let packetsTx = inter.counters?.tx_packets ?? 0;

            if (inter['counters-aggregate']) {
              rx = inter['counters-aggregate'].rx_bytes;
              tx = inter['counters-aggregate'].tx_bytes;
              packetsRx = inter['counters-aggregate'].rx_packets;
              packetsTx = inter['counters-aggregate'].tx_packets;
            } else if (isInterUpstream) {
              for (const ssid of inter.ssids ?? []) {
                rx += ssid.counters?.rx_bytes ?? 0;
                tx += ssid.counters?.tx_bytes ?? 0;
                packetsRx += ssid.counters?.rx_packets ?? 0;
                packetsTx += ssid.counters?.tx_packets ?? 0;
              }
            }

            let rxDelta = rx - (previousRx[inter.name] ?? 0);
            if (rxDelta < 0) rxDelta = 0;
            let txDelta = tx - (previousTx[inter.name] ?? 0);
            if (txDelta < 0) txDelta = 0;
            let packetsRxDelta = packetsRx - (previousPacketsRx[inter.name] ?? 0);
            if (packetsRxDelta < 0) packetsRxDelta = 0;
            let packetsTxDelta = packetsTx - (previousPacketsTx[inter.name] ?? 0);
            if (packetsTxDelta < 0) packetsTxDelta = 0;

            if (data[inter.name] === undefined)
              data[inter.name] = {
                rx: [rxDelta],
                tx: [txDelta],
                packetsRx: [packetsRxDelta],
                packetsTx: [packetsTxDelta],
                recorded: [stat.recorded],
                maxTx: 0,
                maxRx: 0,
                maxPacketsRx: 0,
                maxPacketsTx: 0,
              };
            else {
              if (data[inter.name] && !data[inter.name]?.removed && data[inter.name]?.recorded.length === 1) {
                data[inter.name]?.tx.shift();
                data[inter.name]?.rx.shift();
                data[inter.name]?.packetsTx.shift();
                data[inter.name]?.packetsRx.shift();
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
              data[inter.name]?.packetsRx.push(packetsRxDelta);
              data[inter.name]?.packetsTx.push(packetsTxDelta);
              data[inter.name]?.recorded.push(stat.recorded);
              // @ts-ignore
              if (data[inter.name] !== undefined && txDelta > data[inter.name].maxTx) data[inter.name].maxTx = txDelta;
              // @ts-ignore
              if (data[inter.name] !== undefined && rxDelta > data[inter.name].maxRx) data[inter.name].maxRx = rxDelta;
              // @ts-ignore
              if (data[inter.name] !== undefined && packetsTxDelta > data[inter.name].maxPacketsTx)
                // @ts-ignore
                data[inter.name].maxPacketsTx = packetsTxDelta;
              // @ts-ignore
              if (data[inter.name] !== undefined && packetsRxDelta > data[inter.name].maxPacketsRx)
                // @ts-ignore
                data[inter.name].maxPacketsRx = packetsRxDelta;
            }
            previousRx[inter.name] = rx;
            previousTx[inter.name] = tx;
            previousPacketsRx[inter.name] = packetsRx;
            previousPacketsTx[inter.name] = packetsTx;
          }
        }
      }
      return {
        interfaces: data,
        memory: memoryData,
        vlans: vlanData,
      };
    } catch (e) {
      return undefined;
    }
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
