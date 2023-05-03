import * as React from 'react';
import {
  Box,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Heading,
  Icon,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { ArrowSquareDown, ArrowSquareUp, Clock } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from 'components/Containers/Card';
import { compactSecondsToDetailed, minimalSecondsToDetailed } from 'helpers/dateFormatting';
import { bytesString } from 'helpers/stringHelper';
import { useGetDevicesStats } from 'hooks/Network/Devices';

const SidebarDevices = () => {
  const { t } = useTranslation();
  const getStats = useGetDevicesStats({});
  const [lastTime, setLastTime] = React.useState<Date | undefined>();
  const [lastUpdate, setLastUpdate] = React.useState<Date | undefined>();

  const time = React.useMemo(() => {
    if (lastTime === undefined || lastUpdate === undefined) return null;

    const seconds = lastTime.getTime() - lastUpdate.getTime();

    return Math.max(0, Math.floor(seconds / 1000));
  }, [lastTime, lastUpdate]);

  const circleColor = () => {
    if (time === null) return 'gray.300';
    if (time < 10) return 'green.300';
    if (time < 30) return 'yellow.300';
    return 'red.300';
  };

  React.useEffect(() => {
    setLastUpdate(new Date());
  }, [getStats.data]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setLastTime(new Date());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!getStats.data) return null;

  return (
    <Card p={4}>
      <Tooltip hasArrow label={t('controller.stats.seconds_ago', { s: time })}>
        <CircularProgress
          isIndeterminate
          color={circleColor()}
          position="absolute"
          right="6px"
          top="6px"
          w="unset"
          size={6}
          thickness="14px"
        >
          <CircularProgressLabel fontSize="1.9em">{time}s</CircularProgressLabel>
        </CircularProgress>
      </Tooltip>
      <Tooltip hasArrow label={t('controller.stats.seconds_ago', { s: time })}>
        <Box position="absolute" right="8px" top="8px" w="unset" hidden>
          <Clock size={16} />
        </Box>
      </Tooltip>
      <VStack mb={-1}>
        <Flex flexDir="column" textAlign="center">
          <Heading size="md">{getStats.data.connectedDevices}</Heading>
          <Heading size="xs" display="flex" justifyContent="center">
            <Text>
              {t('common.connected')} {t('devices.title')}{' '}
            </Text>{' '}
          </Heading>
          <Tooltip hasArrow label={compactSecondsToDetailed(getStats.data.averageConnectionTime, t)}>
            <Heading size="md" textAlign="center" mt={1}>
              {minimalSecondsToDetailed(getStats.data.averageConnectionTime, t)}
            </Heading>
          </Tooltip>
          <Heading size="xs">{t('controller.devices.average_uptime')}</Heading>
          <Flex fontSize="sm" fontWeight="bold" alignItems="center" justifyContent="center" mt={1}>
            <Tooltip hasArrow label="Rx">
              <Flex alignItems="center" mr={1}>
                <Icon as={ArrowSquareUp} weight="bold" boxSize={5} mt="1px" color="blue.400" />{' '}
                {getStats.data.rx !== undefined ? bytesString(getStats.data.rx, 0) : '-'}
              </Flex>
            </Tooltip>
            <Tooltip hasArrow label="Tx">
              <Flex alignItems="center">
                <Icon as={ArrowSquareDown} weight="bold" boxSize={5} mt="1px" color="purple.400" />{' '}
                {getStats.data.tx !== undefined ? bytesString(getStats.data.tx, 0) : '-'}
              </Flex>
            </Tooltip>
          </Flex>
        </Flex>
      </VStack>
    </Card>
  );
};

export default SidebarDevices;
