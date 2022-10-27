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
const ConnectedPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'pie', number[], unknown> = React.useMemo(() => {
    const obj = data.status.reduce(
      (acc, curr) => {
        const newObj = { ...acc };

        if (curr.tag === 'connected') {
          newObj.connected = curr.value;
          newObj.connectedPct = Math.floor((curr.value / data.numberOfDevices) * 100);
        } else if (curr.tag === 'disconnected') {
          newObj.disconnected = curr.value;
          newObj.disconnectedPct = Math.floor((curr.value / data.numberOfDevices) * 100);
        } else if (curr.tag === 'not connected') {
          newObj.notConnected = curr.value;
          newObj.notConnectedPct = Math.floor((curr.value / data.numberOfDevices) * 100);
        }

        return newObj;
      },
      {
        connected: 0,
        connectedPct: 0,
        disconnected: 0,
        disconnectedPct: 0,
        notConnected: 0,
        notConnectedPct: 0,
      },
    );

    return {
      labels: [t('common.connected'), t('controller.dashboard.not_connected')],
      datasets: [
        {
          label: t('common.connected'),
          data: [obj.connected, obj.notConnected],
          backgroundColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300
            colorMode === 'light' ? '#63B3ED' : '#63B3ED', // blue-300 - blue-300,
          ],
          borderColor: [
            colorMode === 'light' ? '#68D391' : '#68D391', // green-300 - green-300
            colorMode === 'light' ? '#63B3ED' : '#63B3ED', // blue-300 - blue-300,
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.dashboard.status')}
      explanation={t('controller.firmware.status_explanation')}
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

export default ConnectedPieChart;
