import * as React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import {
  useColorMode,
  Alert,
  AlertDescription,
  AlertTitle,
  Box,
  Center,
  Heading,
  IconButton,
  Link,
  ListItem,
  Spinner,
  UnorderedList,
  useClipboard,
  Tooltip as ChakraTooltip,
  useDisclosure,
} from '@chakra-ui/react';
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
  ChartTypeRegistry,
  ScatterDataPoint,
  BubbleDataPoint,
} from 'chart.js';
import { Pie, getElementAtEvent } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import GraphStatDisplay from 'components/Containers/GraphStatDisplay';
import { Modal } from 'components/Modals/Modal';
import { ControllerDashboardHealth } from 'hooks/Network/Controller';
import { useGetDevicesWithHealthBetween } from 'hooks/Network/HealthChecks';
import { AxiosError } from 'models/Axios';

const LABEL_TO_LIMITS = {
  '100%': { lowerLimit: 100, upperLimit: 100, label: 'With 100% Health' },
  '>90%': { lowerLimit: 90, upperLimit: 99, label: 'Between 90% and 99%' },
  '>60%': { lowerLimit: 60, upperLimit: 89, label: 'Between 60% and 89%' },
  '<=60%': { lowerLimit: 0, upperLimit: 59, label: 'Between 0% and 59%' },
} as const;

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

type Props = {
  data: ControllerDashboardHealth[];
};

const OverallHealthPieChart = ({ data }: Props) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const { hasCopied, onCopy, setValue } = useClipboard('');
  const modalProps = useDisclosure();
  const [deviceCategory, setDeviceCategory] = React.useState<{ lowerLimit: number; upperLimit: number; label: string }>(
    LABEL_TO_LIMITS['100%'],
  );
  const serialNumbersFromCategory = useGetDevicesWithHealthBetween(deviceCategory);
  const chartRef =
    React.useRef<ChartJS<keyof ChartTypeRegistry, (number | ScatterDataPoint | BubbleDataPoint | null)[], unknown>>(
      null,
    );

  const onClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (chartRef.current) {
      const element = getElementAtEvent(chartRef.current, event)?.[0];
      if (element && element.index !== undefined) {
        const label = chartRef.current?.data?.labels?.[element.index] as keyof typeof LABEL_TO_LIMITS | undefined;
        if (label && LABEL_TO_LIMITS[label]) {
          setDeviceCategory(LABEL_TO_LIMITS[label]);
          modalProps.onOpen();
        }
      }
    }
  };

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
      labels.push('<=60%');
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

  React.useEffect(() => {
    if (serialNumbersFromCategory.data) setValue(serialNumbersFromCategory.data.join(','));
  }, [serialNumbersFromCategory.data]);

  return (
    <>
      <GraphStatDisplay
        title={t('controller.dashboard.overall_health')}
        explanation={t('controller.dashboard.overall_health_explanation_pie')}
        chart={
          <Pie
            // @ts-ignore
            ref={chartRef}
            data={parsedData}
            onClick={onClick}
            options={{
              onHover: (e, elements) => {
                const element = e.native?.target as unknown as { style: { cursor: string } };
                if (element && elements.length > 0) {
                  element.style.cursor = 'pointer';
                } else if (element) {
                  element.style.cursor = 'default';
                }
              },
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
      <Modal
        title={t('controller.dashboard.overall_health')}
        {...modalProps}
        options={{
          modalSize: 'sm',
        }}
        topRightButtons={
          <ChakraTooltip label={hasCopied ? `${t('common.copied')}!` : t('common.copy')} hasArrow closeOnClick={false}>
            <IconButton
              aria-label={t('common.copy')}
              icon={<CopyIcon h={5} w={5} />}
              onClick={onCopy}
              colorScheme="teal"
              hidden={!serialNumbersFromCategory.data || serialNumbersFromCategory.data.length === 0}
            />
          </ChakraTooltip>
        }
      >
        {serialNumbersFromCategory.isFetching ? (
          <Center my={8}>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box>
            {serialNumbersFromCategory.error ? (
              <Alert mb={4} status="error">
                <AlertTitle>{t('common.error')}</AlertTitle>
                <AlertDescription>
                  {(serialNumbersFromCategory.error as AxiosError).response?.data.ErrorDescription}
                </AlertDescription>
              </Alert>
            ) : null}
            {serialNumbersFromCategory.data ? (
              <Box>
                <Heading size="md" mb={4}>
                  {serialNumbersFromCategory.data.length} {t('devices.title')} {deviceCategory.label}
                </Heading>
                <Box maxH="70vh" overflowY="auto" overflowX="hidden">
                  <UnorderedList pl={2}>
                    {serialNumbersFromCategory.data
                      .sort((a, b) => a.localeCompare(b))
                      .map((device) => (
                        <ListItem key={device} fontFamily="mono">
                          <Link href={`#/devices/${device}`}>{device}</Link>
                        </ListItem>
                      ))}
                  </UnorderedList>
                </Box>
              </Box>
            ) : null}
          </Box>
        )}
      </Modal>
    </>
  );
};

export default OverallHealthPieChart;
