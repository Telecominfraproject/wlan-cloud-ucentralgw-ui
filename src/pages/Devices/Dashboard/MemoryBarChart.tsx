import * as React from 'react';
import { useColorMode } from '@chakra-ui/react';
import { Chart as ChartJS, CategoryScale, LinearScale, Title, Tooltip, Legend, ChartData, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import GraphStatDisplay from 'components/Containers/GraphStatDisplay';
import { COLORS } from 'constants/colors';
import { ControllerDashboardMemoryUsed } from 'hooks/Network/Controller';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type Props = {
  data: ControllerDashboardMemoryUsed[];
};
const MemoryBarChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'bar', number[], unknown> = React.useMemo(() => {
    const values: number[] = [];
    const labels: string[] = [];

    for (const { tag, value } of data) {
      values.push(value);
      labels.push(tag);
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: COLORS,
          borderColor: COLORS,
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.dashboard.memory')}
      explanation={t('controller.dashboard.memory_explanation')}
      chart={
        <Bar
          data={parsedData}
          options={{
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false,
            },
            scales: {
              xAxes: {
                ticks: {
                  color: colorMode === 'dark' ? 'white' : undefined,
                },
              },
              yAxes: {
                ticks: {
                  color: colorMode === 'dark' ? 'white' : undefined,
                },
              },
            },
            plugins: {
              legend: { display: false },
              title: {
                display: false,
              },

              tooltip: {
                callbacks: {
                  label: (context) =>
                    `${context.label}: ${context.formattedValue} (${
                      Math.round(
                        // @ts-ignore
                        (context.raw / context.dataset.data.reduce((acc, curr) => acc + curr, 0)) * 100 * 100,
                      ) / 100
                    }%)`,
                },
              },
            },
          }}
        />
      }
    />
  );
};

export default MemoryBarChart;
