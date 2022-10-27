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
import { FirmwareDashboardOui } from 'hooks/Network/Firmware';
import { useGetMacOuis } from 'hooks/Network/Statistics';

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
  data: FirmwareDashboardOui[];
};
const OuisBarChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const getOuis = useGetMacOuis({ macs: data.map((oui) => oui.tag) });

  const parsedData: ChartData<'bar', number[], unknown> | undefined = React.useMemo(() => {
    if (!getOuis.data) return undefined;

    const obj: Record<string, number> = {};

    for (const { tag, value } of data.sort((a, b) => b.value - a.value)) {
      const foundLabel = getOuis.data.tagList.find((oui) => oui.tag === tag);
      if (foundLabel) {
        const label = foundLabel.value === '' ? t('common.unknown') : foundLabel.value;
        if (obj[label] === undefined) obj[label] = value;
        else obj[label] += value;
      } else if (!obj[tag] !== undefined) obj[tag] = value;
      else obj[tag] += value;
    }

    const values = [] as [string, number][];
    for (const [key, value] of Object.entries(obj)) {
      values.push([key, value]);
    }
    const sorted = values.sort((a, b) => b[1] - a[1]);

    return {
      labels: sorted.map((value) => value[0]),
      datasets: [
        {
          data: sorted.map((value) => value[1]),
          backgroundColor: COLORS,
          borderColor: COLORS,
          borderWidth: 1,
        },
      ],
    };
  }, [data, getOuis.data]);

  return (
    <GraphStatDisplay
      title="OUIs"
      explanation={t('controller.firmware.ouis_explanation')}
      chart={parsedData && <Bar data={parsedData} height="300px" options={OPTIONS(colorMode)} />}
    />
  );
};

export default OuisBarChart;
