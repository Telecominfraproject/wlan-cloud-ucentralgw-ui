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
import { ControllerDashboardAssociations } from 'hooks/Network/Controller';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  data: ControllerDashboardAssociations[];
};
const AssociationsPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'pie', number[], unknown> = React.useMemo(() => {
    const obj = data.reduce(
      (acc, curr) => {
        const newObj = { ...acc };
        newObj[curr.tag] = curr.value;
        return newObj;
      },
      {
        '2G': 0,
        '5G': 0,
        '6G': 0,
      },
    );

    return {
      labels: ['2G', '5G', '6G'],
      datasets: [
        {
          data: [obj['2G'], obj['5G'], obj['6G']],
          backgroundColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300
            colorMode === 'light' ? '#63B3ED' : '#63B3ED', // blue-300 - blue-300,
            colorMode === 'light' ? '#4FD1C5' : '#4FD1C5', // teal-300 - teal-300
          ],
          borderColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300
            colorMode === 'light' ? '#63B3ED' : '#63B3ED', // blue-300 - blue-300,
            colorMode === 'light' ? '#4FD1C5' : '#4FD1C5', // teal-300 - teal-300
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.dashboard.associations')}
      explanation={t('controller.dashboard.associations_explanation')}
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

export default AssociationsPieChart;
