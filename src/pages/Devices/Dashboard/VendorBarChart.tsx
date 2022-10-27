import * as React from 'react';
import { useColorMode } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartData,
  BarElement,
  CoreChartOptions,
  ElementChartOptions,
  PluginChartOptions,
  DatasetChartOptions,
  ScaleChartOptions,
  BarControllerChartOptions,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/types/utils';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import GraphStatDisplay from 'components/Containers/GraphStatDisplay';
import { COLORS } from 'constants/colors';
import { ControllerDashboardVendor } from 'hooks/Network/Controller';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OPTIONS: (
  colorMode: string,
) => _DeepPartialObject<
  CoreChartOptions<'bar'> &
    ElementChartOptions<'bar'> &
    PluginChartOptions<'bar'> &
    DatasetChartOptions<'bar'> &
    ScaleChartOptions<'bar'> &
    BarControllerChartOptions
> = (colorMode) => ({
  responsive: true,
  indexAxis: 'y',
  interaction: {
    mode: 'nearest',
    axis: 'y',
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
        callback(value) {
          return this.getLabelForValue(value as number)?.split(' ')?.[0] ?? '';
        },
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
});

type Props = {
  data: ControllerDashboardVendor[];
};
const VendorBarChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'bar', number[], unknown> = React.useMemo(() => {
    const values: number[] = [];
    const labels: string[] = [];

    for (const { tag, value } of data.sort((a, b) => b.value - a.value)) {
      values.push(value);
      labels.push(tag === '' ? t('controller.dashboard.unrecognized') : tag);
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
      title={t('controller.dashboard.vendors')}
      explanation={t('controller.dashboard.vendors_explanation')}
      chart={<Bar data={parsedData} height="300px" options={OPTIONS(colorMode)} />}
    />
  );
};

export default VendorBarChart;
