import * as React from 'react';
import { Flex, Heading, Icon, Text, Tooltip, VStack } from '@chakra-ui/react';
import { ArrowSquareDown, ArrowSquareUp } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Card } from 'components/Containers/Card';
import { compactSecondsToDetailed, minimalSecondsToDetailed } from 'helpers/dateFormatting';
import { bytesString } from 'helpers/stringHelper';
import { useGetDevicesStats } from 'hooks/Network/Devices';

const SidebarDevices = () => {
  const { t } = useTranslation();
  const getStats = useGetDevicesStats({});

  if (!getStats.data) return null;

  return (
    <Card p={4}>
      <VStack mb={-1}>
        <Flex flexDir="column" textAlign="center">
          <Heading size="xs" display="flex" justifyContent="center">
            <Text>
              {t('common.connected')} {t('devices.title')}{' '}
            </Text>{' '}
          </Heading>
          <Heading size="md">{getStats.data.connectedDevices}</Heading>
          <Heading size="xs">{t('controller.devices.average_uptime')}</Heading>
          <Tooltip hasArrow label={compactSecondsToDetailed(getStats.data.averageConnectionTime, t)}>
            <Heading size="md" textAlign="center" mt={1}>
              {minimalSecondsToDetailed(getStats.data.averageConnectionTime, t)}
            </Heading>
          </Tooltip>

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
