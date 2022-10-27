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

type Props = {
  data: {
    used: number[];
    buffered: number[];
    cached: number[];
    free: number[];
    total: number[];
    recorded: number[];
  };
};

const DeviceMemoryChart = ({ data }: Props) => {
  const { colorMode } = useColorMode();

  const points = {
    labels: data.recorded.map((recorded) => new Date(recorded * 1000).toLocaleTimeString()),
    datasets: [
      {
        label: 'Free',
        data: data.free.map((free) => Math.floor(free / 1024 / 1024)),
        borderColor: colorMode === 'light' ? '#63B3ED' : '#BEE3F8', // blue-300 - blue-100
        backgroundColor: colorMode === 'light' ? '#63B3ED' : '#BEE3F8', // blue-300 - blue-100
      },
      {
        label: 'Buffered',
        data: data.buffered.map((buffered) => Math.floor(buffered / 1024 / 1024)),
        borderColor: colorMode === 'light' ? '#ECC94B' : '#FAF089', // yellow-400 - yellow-200
        backgroundColor: colorMode === 'light' ? '#ECC94B' : '#FAF089', // yellow-400 - yellow-200
      },
      {
        label: 'Cached',
        data: data.cached.map((cached) => Math.floor(cached / 1024 / 1024)),
        borderColor: colorMode === 'light' ? '#ED64A6' : '#FBB6CE', // pink-400 - pink-200
        backgroundColor: colorMode === 'light' ? '#ED64A6' : '#FBB6CE', // pink-400 - pink-200
      },
    ],
  };

  return (
    <Line
      options={{
        responsive: true,
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
              label: (context) => `${context.dataset.label}: ${context.formattedValue} MB`,
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
              callback: (tickValue) => `${tickValue} MB`,
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

export default React.memo(DeviceMemoryChart);
