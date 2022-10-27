import * as React from 'react';
import { Flex, Heading, Tooltip, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { compactSecondsToDetailed, minimalSecondsToDetailed } from 'helpers/dateFormatting';
import { useGetDevicesStats } from 'hooks/Network/Devices';

const SidebarDevices = () => {
  const { t } = useTranslation();
  const getStats = useGetDevicesStats({});
  const [lastTime, setLastTime] = React.useState<Date | undefined>();
  const [lastUpdate, setLastUpdate] = React.useState<Date | undefined>();

  const getTime = () => {
    if (lastTime === undefined || lastUpdate === undefined) return null;

    const seconds = lastTime.getTime() - lastUpdate.getTime();

    return Math.max(0, Math.floor(seconds / 1000));
  };

  const refresh = () => {
    if (document.visibilityState !== 'hidden') {
      getStats.refetch();
    }
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

  React.useEffect(() => {
    document.addEventListener('visibilitychange', refresh);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  if (!getStats.data) return null;

  return (
    <VStack spacing={4}>
      <Flex flexDir="column" textAlign="center">
        <Heading size="md">{getStats.data.connectedDevices}</Heading>
        <Heading size="xs">
          {t('common.connected')} {t('devices.title')}
        </Heading>
        <Heading size="xs" mt={1} fontStyle="italic" fontWeight="normal" color="gray.400">
          ({getStats.data.connectingDevices} {t('controller.devices.connecting')})
        </Heading>
        <Tooltip hasArrow label={compactSecondsToDetailed(getStats.data.averageConnectionTime, t)}>
          <Heading size="md" textAlign="center" mt={2}>
            {minimalSecondsToDetailed(getStats.data.averageConnectionTime, t)}
          </Heading>
        </Tooltip>
        <Heading size="xs">{t('controller.devices.average_uptime')}</Heading>
        <Heading size="xs" mt={2} fontStyle="italic" fontWeight="normal" color="gray.400">
          {t('controller.stats.seconds_ago', { s: getTime() })}
        </Heading>
      </Flex>
    </VStack>
  );
};

export default SidebarDevices;
