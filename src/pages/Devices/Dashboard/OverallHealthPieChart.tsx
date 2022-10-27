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
  ArcElement,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import GraphStatDisplay from 'components/Containers/GraphStatDisplay';
import { ControllerDashboardHealth } from 'hooks/Network/Controller';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  data: ControllerDashboardHealth[];
};
const OverallHealthPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'pie', number[], unknown> = React.useMemo(() => {
    const totalDevices = data.reduce(
      (acc, curr) => {
        let newHealth = 0;
        if (curr.tag === '100%') newHealth = curr.value * 100;
        else if (curr.tag === '>90%') newHealth = curr.value * 95;
        else if (curr.tag === '>60%') newHealth = curr.value * 75;
        else if (curr.tag === '<60%') newHealth = curr.value * 30;
        const newAcc: {
          totalHealth: number;
          totalDevices: number;
          '100%': number;
          '>90%': number;
          '>60%': number;
          '<60%': number;
        } = acc;
        newAcc.totalHealth += newHealth;
        newAcc.totalDevices += curr.value;
        newAcc[curr.tag] = curr.value;
        return newAcc;
      },
      {
        totalHealth: 0,
        totalDevices: 0,
        '100%': 0,
        '>90%': 0,
        '>60%': 0,
        '<60%': 0,
      },
    );

    const newData = [];
    const labels = [];
    const backgroundColor = [];
    const borderColor = [];

    if (totalDevices['100%'] > 0) {
      newData.push(totalDevices['100%']);
      labels.push('100%');
      const color = colorMode === 'light' ? '#68D391' : '#68D391';
      backgroundColor.push(color);
      borderColor.push(color);
    }
    if (totalDevices['>90%'] > 0) {
      newData.push(totalDevices['>90%']);
      labels.push('>90%');
      const color = colorMode === 'light' ? '#F6E05E' : '#F6E05E';
      backgroundColor.push(color);
      borderColor.push(color);
    }
    if (totalDevices['>60%'] > 0) {
      newData.push(totalDevices['>60%']);
      labels.push('>60%');
      const color = colorMode === 'light' ? '#F6AD55' : '#F6AD55';
      backgroundColor.push(color);
      borderColor.push(color);
    }
    if (totalDevices['<60%'] > 0) {
      newData.push(totalDevices['<60%']);
      labels.push('<60%');
      const color = colorMode === 'light' ? '#FC8181' : '#FC8181';
      backgroundColor.push(color);
      borderColor.push(color);
    }

    return {
      labels,
      datasets: [
        {
          label: t('common.connected'),
          data: newData,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.dashboard.overall_health')}
      explanation={t('controller.dashboard.overall_health_explanation_pie')}
      chart={
        <Pie
          data={parsedData}
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
                callbacks: {
                  label: (context) =>
                    `${context.label}: ${context.formattedValue} (${Math.round(
                      // @ts-ignore
                      (context.raw / context.dataset.data.reduce((acc, curr) => acc + curr, 0)) * 100,
                    )}%)`,
                },
              },
            },
          }}
        />
      }
    />
  );
};

export default OverallHealthPieChart;
