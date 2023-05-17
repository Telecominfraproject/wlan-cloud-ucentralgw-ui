import * as React from 'react';
import { Box, Center, Flex, Heading, HStack, Select, Spacer, Spinner } from '@chakra-ui/react';
import { ChartLine } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import StatisticsCardDatePickers from './DatePickers';
import InterfaceChart from './InterfaceChart';
import DeviceMemoryChart from './MemoryChart';
import { useStatisticsCard } from './useStatisticsCard';
import ViewLastStatsModal from './ViewLastStatsModal';
import VlanChart from './VlanChart';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { LoadingOverlay } from 'components/LoadingOverlay';

const interfaceNameLabel = (v?: string) => {
  if (!v) return '';

  if (v.startsWith('up')) {
    const split = v.split('v');
    const vlanId = split[split.length - 1];

    return vlanId === '0' ? 'Upstream' : `Upstream - Vlan ${vlanId}`;
  }
  if (v.startsWith('down')) {
    const split = v.split('v');
    const vlanId = split[split.length - 1];

    return vlanId === '0' ? 'Downstream' : `Downstream - Vlan ${vlanId}`;
  }

  return v;
};

type Props = {
  serialNumber: string;
};

const DeviceStatisticsCard = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const { time, setTime, parsedData, isLoading, selected, onSelectInterface, refresh } = useStatisticsCard({
    serialNumber,
  });
  const [formatChosen, setFormatChosen] = React.useState<'bytes' | 'packets'>('bytes');

  const setNewTime = (start: Date, end: Date) => {
    setTime({ start, end });
  };
  const onClear = () => {
    setTime(undefined);
  };

  const onFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormatChosen(e.target.value as 'bytes' | 'packets');
  };

  const interfaces = React.useMemo(() => {
    if (!parsedData) return undefined;

    return Object.entries(parsedData.interfaces).map(([name, data]) => (
      <Box hidden={name !== selected} key={uuid()}>
        <InterfaceChart data={data} format={formatChosen} />
      </Box>
    ));
  }, [parsedData, selected, formatChosen]);
  const vlans = React.useMemo(() => {
    if (!parsedData) return undefined;

    return Object.entries(parsedData.vlans).map(([name, data]) => (
      <Box hidden={`VLAN-${name}` !== selected} key={uuid()}>
        <VlanChart data={data} format={formatChosen} />
      </Box>
    ));
  }, [parsedData, selected, formatChosen]);

  const memory = React.useMemo(() => {
    if (!parsedData) return undefined;

    return <DeviceMemoryChart data={parsedData.memory} />;
  }, [parsedData]);

  return (
    <Card mb={4}>
      <CardHeader
        icon={<ChartLine weight="bold" size={20} />}
        headerStyle={{
          color: 'green',
        }}
      >
        <Heading size="md">{t('configurations.statistics')}</Heading>
        <Spacer />
        <HStack>
          {selected === 'memory' ? null : (
            <Select value={formatChosen} onChange={onFormatChange} w="112px">
              <option value="bytes">Data</option>
              <option value="packets">Packets</option>
            </Select>
          )}
          <Select value={selected} onChange={onSelectInterface} w="unset">
            {parsedData?.interfaces
              ? Object.keys(parsedData.interfaces).map((v) => (
                  <option value={v} key={uuid()}>
                    {interfaceNameLabel(v)}
                  </option>
                ))
              : null}
            {parsedData?.vlans
              ? Object.keys(parsedData.vlans).map((v) => (
                  <option value={`VLAN-${v}`} key={uuid()}>
                    VLAN - {v}
                  </option>
                ))
              : null}
            <option value="memory">{t('statistics.memory')}</option>
          </Select>
          <StatisticsCardDatePickers defaults={time} setTime={setNewTime} onClear={onClear} />
          <ViewLastStatsModal serialNumber={serialNumber} />
          <RefreshButton
            size="sm"
            onClick={refresh}
            isCompact
            isFetching={isLoading.isLoading}
            // @ts-ignore
            colorScheme="blue"
          />
        </HStack>
      </CardHeader>
      <CardBody display="block" mb={2} minH="230px">
        {time && (
          <Flex>
            <Heading size="sm">
              {t('controller.devices.from_to', {
                from: `${time.start.toLocaleDateString()} ${time.start.toLocaleTimeString()}`,
                to: `${time.end.toLocaleDateString()} ${time.end.toLocaleTimeString()}`,
              })}
            </Heading>
          </Flex>
        )}
        {(!parsedData && isLoading.isLoading) || (isLoading.isLoading && isLoading.progress !== undefined) ? (
          <Center my="auto" mt="100px">
            {isLoading.progress !== undefined && (
              <Heading size="md" mr={2}>
                {isLoading.progress.toFixed(2)}%
              </Heading>
            )}
            <Spinner size="xl" />
          </Center>
        ) : (
          <LoadingOverlay isLoading={isLoading.isLoading}>
            <Box>
              {selected === 'memory' && memory}
              {interfaces}
              {vlans}
            </Box>
          </LoadingOverlay>
        )}
      </CardBody>
    </Card>
  );
};

export default DeviceStatisticsCard;
