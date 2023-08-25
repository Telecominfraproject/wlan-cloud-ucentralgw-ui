import * as React from 'react';
import { Box, Center, Divider, Flex, Heading, useBreakpoint, useColorMode } from '@chakra-ui/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  CoreChartOptions,
  ElementChartOptions,
  PluginChartOptions,
  DatasetChartOptions,
  ScaleChartOptions,
  LineControllerChartOptions,
} from 'chart.js';
import { _DeepPartialObject } from 'chart.js/types/utils';
import { Line } from 'react-chartjs-2';
import { EndpointApiResponse } from 'hooks/Network/Endpoints';
import { SystemResources, useGetSystemResources } from 'hooks/Network/System';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { CardBody } from 'components/Containers/Card/CardBody';
import { bytesString } from 'helpers/stringHelper';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const getDivisionFactor = (maxBytes: number) => {
  if (maxBytes < 1024) {
    return { factor: 1, unit: 'B' };
  }
  if (maxBytes < 1024 * 1024) {
    return { factor: 1024, unit: 'KB' };
  }
  if (maxBytes < 1024 * 1024 * 1024) {
    return { factor: 1024 * 1024, unit: 'MB' };
  }
  return { factor: 1024 * 1024 * 1024, unit: 'GB' };
};

interface Props {
  endpoint: EndpointApiResponse;
  token: string;
}

const MonitoringSystemCard = ({ endpoint, token }: Props) => {
  const { colorMode } = useColorMode();
  const [cumulativeData, setCumulativeData] = React.useState<(SystemResources & { timestamp: Date })[]>([]);
  const breakpoint = useBreakpoint();

  const isVertical = React.useMemo(
    () => breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md',
    [breakpoint],
  );

  const onNewData = (data: SystemResources) => {
    if (cumulativeData.length > 100) {
      setCumulativeData((prev) => [...prev.slice(1), { ...data, timestamp: new Date() }]);
    } else {
      setCumulativeData((prev) => [...prev, { ...data, timestamp: new Date() }]);
    }
  };

  const getResources = useGetSystemResources({ endpoint: endpoint.uri, token, onSuccess: onNewData });

  const data = React.useMemo(() => {
    const labels = [] as string[];
    const currentRealMemory = [] as string[];
    const peakRealMemory = [] as string[];
    const currentVirtualMemory = [] as string[];
    const peakVirtualMemory = [] as string[];
    const numberOfFileDescriptors = [] as number[];

    let highestRealMem = 0;
    let highestVirtualMem = 0;
    for (const curr of cumulativeData) {
      if (curr.currRealMem > highestRealMem) highestRealMem = curr.currRealMem;
      if (curr.currVirtMem > highestVirtualMem) highestVirtualMem = curr.currVirtMem;
    }

    const realMemFactor = getDivisionFactor(highestRealMem);
    const virtualMemFactor = getDivisionFactor(highestVirtualMem);

    for (const curr of cumulativeData) {
      labels.push(curr.timestamp.toLocaleTimeString());
      currentRealMemory.push((Math.floor((curr.currRealMem / realMemFactor.factor) * 100) / 100).toFixed(2));
      peakRealMemory.push((Math.floor((curr.peakRealMem / realMemFactor.factor) * 100) / 100).toFixed(2));
      currentVirtualMemory.push((Math.floor((curr.currVirtMem / virtualMemFactor.factor) * 100) / 100).toFixed(2));
      peakVirtualMemory.push((Math.floor((curr.peakVirtMem / virtualMemFactor.factor) * 100) / 100).toFixed(2));
      numberOfFileDescriptors.push(curr.numberOfFileDescriptors);
    }

    const datasets = [
      {
        label: 'Curr. Real Mem.',
        data: currentRealMemory,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        pointRadius: 0,
      },
      {
        label: 'Curr. Virt. Mem.',
        data: currentVirtualMemory,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        pointRadius: 0,
      },
      {
        label: 'File Descriptors',
        data: numberOfFileDescriptors,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        pointRadius: 0,
      },
    ] as const;

    const newData = {
      labels,
      realMemFactor,
      virtualMemFactor,
      dataTick: (value: number) => {
        try {
          const temp = String(value);

          if (temp.includes('.')) {
            return Number(temp).toFixed(1);
          }

          return temp;
        } catch (e) {
          return value;
        }
      },
      datasets,
    };

    return newData;
  }, [cumulativeData]);

  const options: (
    factor?: number,
    unit?: string,
  ) => _DeepPartialObject<
    CoreChartOptions<'line'> &
      ElementChartOptions<'line'> &
      PluginChartOptions<'line'> &
      DatasetChartOptions<'line'> &
      ScaleChartOptions<'line'> &
      LineControllerChartOptions
  > = React.useMemo(
    () => (_?: number, unit?: string) => ({
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          mode: 'index',
          position: 'nearest',
          intersect: false,

          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.formattedValue} ${unit ?? ''}`,
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
            autoSkip: true,
            maxTicksLimit: 10,
          },
        },
        y: {
          grid: {
            color: colorMode === 'dark' ? 'white' : undefined,
          },
          ticks: {
            color: colorMode === 'dark' ? 'white' : undefined,
            callback: (tickValue) => (unit ? `${data.dataTick(tickValue as number)} ${unit}` : tickValue),
          },
          beginAtZero: true,
        },
      },
      elements: {
        line: {
          tension: 0.4,
        },
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
    }),
    [colorMode, data],
  );

  if (getResources.error || getResources.isLoading) return null;

  return (
    <Card>
      <CardHeader>
        <Heading size="md" pt={0}>
          {endpoint.type}
        </Heading>
      </CardHeader>
      <CardBody>
        {isVertical ? (
          <Box w="100%" display="block">
            <Box mb={4}>
              <Heading size="sm">Real Memory (Peak: {bytesString(getResources.data?.peakRealMem ?? 0)})</Heading>
              <Box position="relative" w="100%">
                <Line
                  options={options(data.realMemFactor.factor, data.realMemFactor.unit)}
                  data={{ ...data, datasets: [data.datasets[0]] }}
                />
              </Box>
            </Box>
            <Box>
              <Heading size="sm">Virtual Memory (Peak: {bytesString(getResources.data?.peakVirtMem ?? 0)})</Heading>
              <Box position="relative" w="100%">
                <Line
                  options={options(data.virtualMemFactor.factor, data.virtualMemFactor.unit)}
                  data={{ ...data, datasets: [data.datasets[1]] }}
                />
              </Box>
            </Box>
            <Box>
              <Heading size="sm">File Descriptors</Heading>
              <Box position="relative" w="100%">
                <Line options={options()} data={{ ...data, datasets: [data.datasets[2]] }} height={180} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Box w="100%" display="block">
            <Flex w="100%">
              <Box w="100%">
                <Center>
                  <Heading size="sm">Real Memory (Peak: {bytesString(getResources.data?.peakRealMem ?? 0)})</Heading>
                </Center>
                <Box position="relative" w="100%">
                  <Line
                    options={options(data.realMemFactor.factor, data.realMemFactor.unit)}
                    data={{ ...data, datasets: [data.datasets[0]] }}
                    height={180}
                  />
                </Box>
              </Box>
              <Divider height="180px" mx={4} orientation="vertical" />
              <Box w="100%">
                <Center>
                  <Heading size="sm">Virtual Memory (Peak: {bytesString(getResources.data?.peakVirtMem ?? 0)})</Heading>
                </Center>
                <Box position="relative" w="100%">
                  <Line
                    options={options(data.virtualMemFactor.factor, data.virtualMemFactor.unit)}
                    data={{ ...data, datasets: [data.datasets[1]] }}
                    height={180}
                  />
                </Box>
              </Box>
              <Divider height="180px" mx={4} orientation="vertical" />
              <Box w="100%">
                <Center>
                  <Heading size="sm">File Descriptors</Heading>
                </Center>
                <Box position="relative" w="100%">
                  <Line options={options()} data={{ ...data, datasets: [data.datasets[2]] }} height={180} />
                </Box>
              </Box>
            </Flex>
          </Box>
        )}
      </CardBody>
    </Card>
  );
};

export default MonitoringSystemCard;
