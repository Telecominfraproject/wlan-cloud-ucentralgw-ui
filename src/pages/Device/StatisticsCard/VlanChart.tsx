import * as React from 'react';
import { useColorMode } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const getDivisionFactor = (maxBytes: number) => {
  if (maxBytes < 1024) {
    return { factor: 1, unit: 'B' };
  }
  if (maxBytes < 1024 * 1024) {
    return { factor: 1024, unit: 'KB' };
  }
  if (maxBytes < 1024 * 1024 * 1024) {
    return { factor: 1024 * 1024, unit: 'MB' };
  }
  return { factor: 1024 * 1024 * 1024, unit: 'GB' };
};

const getDivisionFactorPackets = (maxPackets: number) => {
  if (maxPackets < 1000) {
    return { factor: 1, unit: '' };
  }
  if (maxPackets < 1000 * 1000) {
    return { factor: 1000, unit: 'K' };
  }
  if (maxPackets < 1000 * 1000 * 1000) {
    return { factor: 1000 * 1000, unit: 'M' };
  }
  return { factor: 1000 * 1000 * 1000, unit: 'G' };
};

type Props = {
  data: {
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
  };
  format: 'bytes' | 'packets';
};

const VlanChart = ({ data, format }: Props) => {
  const { colorMode } = useColorMode();

  const { factor, unit } = getDivisionFactor(data.maxTx);
  const packetsFactor = getDivisionFactorPackets(
    data.maxPacketsTx > data.maxPacketsRx ? data.maxPacketsTx : data.maxPacketsRx,
  );

  const bytesPoints: ChartData<'line', string[], string> = {
    labels: data.recorded.map((recorded) => new Date(recorded * 1000).toLocaleTimeString()),
    datasets: [
      {
        // Real 'Tx', but shown as 'Rx'
        label: 'Tx',
        data: data.rx.map((tx) => (Math.floor((tx / factor) * 100) / 100).toFixed(2)),
        borderColor: colorMode === 'light' ? 'rgba(99, 179, 237, 1)' : 'rgba(190, 227, 248, 1)', // blue-300 - blue-100
        backgroundColor: colorMode === 'light' ? 'rgba(99, 179, 237, 0.3)' : 'rgba(190, 227, 248, 0.3)', // blue-300 - blue-100
        tension: 0.5,
        pointRadius: 0,
        fill: 'start',
      },
      {
        // Real 'Rx', but shown as 'Tx'
        label: 'Rx',
        data: data.tx.map((rx) => (Math.floor((rx / factor) * 100) / 100).toFixed(2)),
        borderColor: colorMode === 'light' ? 'rgba(72, 187, 120, 1)' : 'rgba(154, 230, 180, 1)', // green-400 - green-200
        backgroundColor: colorMode === 'light' ? 'rgba(72, 187, 120, 0.3)' : 'rgba(154, 230, 180, 0.3)', // green-400 - green-200
        tension: 0.5,
        pointRadius: 0,
        fill: 'start',
      },
    ],
  };
  const packetPoints: ChartData<'line', string[], string> = {
    labels: data.recorded.map((recorded) => new Date(recorded * 1000).toLocaleTimeString()),
    datasets: [
      {
        // Real 'Tx', but shown as 'Rx'
        label: 'Tx',
        data: data.packetsRx.map((rx) => rx.toString()),
        borderColor: colorMode === 'light' ? 'rgba(99, 179, 237, 1)' : 'rgba(190, 227, 248, 1)', // blue-300 - blue-100
        backgroundColor: colorMode === 'light' ? 'rgba(99, 179, 237, 0.3)' : 'rgba(190, 227, 248, 0.3)', // blue-300 - blue-100
        tension: 0.5,
        pointRadius: 0,
        fill: 'start',
      },
      {
        // Real 'Tx', but shown as 'Rx'
        label: 'Rx',
        data: data.packetsTx.map((tx) => tx.toString()),
        borderColor: colorMode === 'light' ? 'rgba(72, 187, 120, 1)' : 'rgba(154, 230, 180, 1)', // green-400 - green-200
        backgroundColor: colorMode === 'light' ? 'rgba(72, 187, 120, 0.3)' : 'rgba(154, 230, 180, 0.3)', // green-400 - green-200
        tension: 0.5,
        pointRadius: 0,
        fill: 'start',
      },
    ],
  };

  const dataTick = (value: string | number) => {
    try {
      const temp = String(value);

      if (temp.includes('.')) {
        return Number(temp).toFixed(1);
      }

      return temp;
    } catch (e) {
      return value;
    }
  };

  const packetsTick = (value: number) => {
    if (packetsFactor.factor === 1) {
      return value.toLocaleString();
    }
    return `${(value / packetsFactor.factor).toLocaleString()}${packetsFactor.unit}`;
  };

  return (
    <Line
      options={{
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              color: colorMode === 'dark' ? 'white' : undefined,
            },
          },
          title: {
            display: false,
          },
          tooltip: {
            mode: 'index',
            position: 'nearest',
            intersect: false,

            callbacks: {
              label:
                format === 'bytes'
                  ? (context) => `${context.dataset.label}: ${context.formattedValue} ${unit}`
                  : undefined,
            },
          },
        },
        scales: {
          x: {
            grid: {
              color: colorMode === 'dark' ? 'white' : undefined,
            },
            ticks: {
              color: colorMode === 'dark' ? 'white' : undefined,
              maxRotation: 10,
            },
          },
          y: {
            grid: {
              color: colorMode === 'dark' ? 'white' : undefined,
            },
            ticks: {
              color: colorMode === 'dark' ? 'white' : undefined,
              callback:
                format === 'bytes'
                  ? (tickValue) => `${dataTick(tickValue)} ${unit}`
                  : (tickValue) => (typeof tickValue === 'number' ? packetsTick(tickValue) : tickValue),
            },
          },
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
      }}
      data={format === 'bytes' ? bytesPoints : packetPoints}
    />
  );
};

export default React.memo(VlanChart);
