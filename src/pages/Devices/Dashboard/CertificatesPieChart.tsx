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
import { ControllerDashboardCertificates } from 'hooks/Network/Controller';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  data: ControllerDashboardCertificates[];
};
const CertificatesPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();

  const parsedData: ChartData<'pie', number[], unknown> = React.useMemo(() => {
    const values = {
      verified: 0,
      serialMismatch: 0,
      noCertificate: 0,
      other: 0,
    };
    const labels: string[] = [];
    const colors: string[] = [];

    for (const { tag, value } of data.sort((a, b) => b.value - a.value)) {
      if (tag === 'verified') {
        values.verified += value;
        labels.push(t('controller.dashboard.verified'));
        colors.push(colorMode === 'light' ? '#68D391' : '#68D391');
      } else if (tag === 'serial mismatch') {
        values.verified += value;
        labels.push(t('controller.dashboard.serial_mismatch'));
        colors.push(colorMode === 'light' ? '#F6E05E' : '#F6E05E');
      } else if (tag === 'no certificate') {
        values.verified += value;
        labels.push(t('controller.dashboard.no_certificate'));
        colors.push(colorMode === 'light' ? '#FC8181' : '#FC8181');
      } else {
        values.other += value;
        labels.push(t('controller.dashboard.unknown_status'));
        colors.push(colorMode === 'light' ? '#F6AD55' : '#F6AD55');
      }
    }

    return {
      labels,
      datasets: [
        {
          data: Object.entries(values)
            .filter(([, value]) => value !== 0)
            .map(([, value]) => value),
          backgroundColor: colors,
          borderColor: colors,
          borderWidth: 1,
        },
      ],
    };
  }, [data, colorMode]);

  return (
    <GraphStatDisplay
      title={t('controller.dashboard.certificates')}
      explanation={t('controller.dashboard.certificates_explanation')}
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

export default CertificatesPieChart;
