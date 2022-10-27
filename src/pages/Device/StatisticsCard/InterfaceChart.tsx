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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

  const points = {
    labels: data.recorded.map((recorded) => new Date(recorded * 1000).toLocaleTimeString()),
    datasets: [
      {
        label: 'Tx',
        data: data.tx.map((tx) => Math.floor((tx / factor) * 100) / 100),
        borderColor: colorMode === 'light' ? '#63B3ED' : '#BEE3F8', // blue-300 - blue-100
        backgroundColor: colorMode === 'light' ? '#63B3ED' : '#BEE3F8', // blue-300 - blue-100
      },
      {
        label: 'Rx',
        data: data.rx.map((rx) => Math.floor((rx / factor) * 100) / 100),
        borderColor: colorMode === 'light' ? '#48BB78' : '#9AE6B4', // green-400 - green-200
        backgroundColor: colorMode === 'light' ? '#48BB78' : '#9AE6B4', // green-400 - green-200
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
