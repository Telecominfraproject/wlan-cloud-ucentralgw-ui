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
import { FirmwareDashboardResponse } from 'hooks/Network/Firmware';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  data: FirmwareDashboardResponse;
};
const FirmwareLatestPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'pie', number[], unknown> = React.useMemo(() => {
    const usingLatest = data.usingLatest.reduce((acc, curr) => acc + curr.value, 0);
    const usingOther = data.unknownFirmwares.reduce((acc, curr) => acc + curr.value, 0);

    return {
      labels: [t('controller.firmware.up_to_date'), t('controller.firmware.unrecognized')],
      datasets: [
        {
          data: [usingLatest, usingOther],
          backgroundColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300]
            colorMode === 'light' ? '#4FD1C5' : '#4FD1C5', // teal-300 - teal-300
          ],
          borderColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300]
            colorMode === 'light' ? '#4FD1C5' : '#4FD1C5', // teal-300 - teal-300
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.firmware.up_to_date')}
      explanation={t('controller.firmware.up_to_date_explanation')}
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

export default FirmwareLatestPieChart;
