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
  Filler,
  ChartData,
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

type Props = {
  data: {
    tx: number[];
    rx: number[];
    recorded: number[];
    maxTx: number;
    maxRx: number;
  };
};

const InterfaceChart = ({ data }: Props) => {
  const { colorMode } = useColorMode();

  const { factor, unit } = getDivisionFactor(data.maxTx);

  const points: ChartData<'line', string[], string> = {
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
              label: (context) => `${context.dataset.label}: ${context.formattedValue} ${unit}`,
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
              callback: (tickValue) => `${tickValue} ${unit}`,
            },
          },
        },
        hover: {
          mode: 'nearest',
          intersect: true,
        },
      }}
      data={points}
    />
  );
};

export default React.memo(InterfaceChart);
