import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Flex,
  Heading,
  Spacer,
  Spinner,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { Info, WifiHigh } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import AssociationsPieChart from './AssociationsPieChart';
import CertificatesPieChart from './CertificatesPieChart';
import CommandsBarChart from './CommandsBarChart';
import ConnectedPieChart from './ConnectedPieChart';
import DeviceTypesPieChart from './DeviceTypesPieChart';
import MemoryBarChart from './MemoryBarChart';
import MemorySimpleChart from './MemorySimpleChart';
import OverallHealthSimple from './OverallHealth';
import OverallHealthPieChart from './OverallHealthPieChart';
import UptimesBarChart from './UptimesBarChart';
import VendorBarChart from './VendorBarChart';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { useGetControllerDashboard } from 'hooks/Network/Controller';

const DevicesDashboard = () => {
  const { t } = useTranslation();
  const getDashboard = useGetControllerDashboard();
  return (
    <>
      <Card mb="20px">
        <CardHeader variant="unstyled" px={4} py={2}>
          <Flex alignItems="center">
            <Heading size="md">{t('analytics.last_ping')}</Heading>
            <Text ml={1} pt={0.5}>
              <FormattedDate date={getDashboard.data?.snapshot ?? 0} key={getDashboard.dataUpdatedAt} />
            </Text>
            <Tooltip label={t('controller.dashboard.last_ping_explanation')} hasArrow>
              <Info style={{ marginLeft: '4px', marginTop: '2px' }} />
            </Tooltip>
          </Flex>
          <Spacer />
          <RefreshButton isCompact onClick={getDashboard.refetch} isFetching={getDashboard.isFetching} />
        </CardHeader>
      </Card>
      <Box display="block" w="100%">
        <>
          {getDashboard.isLoading && (
            <Center my="100px">
              <Spinner size="xl" />
            </Center>
          )}
          {getDashboard.error && (
            <Center my="100px">
              <Alert status="error" mb={4} w="unset">
                <AlertIcon />
                <Box>
                  <AlertTitle>{t('controller.dashboard.error_fetching')}</AlertTitle>
                  {
                    // @ts-ignore
                    <AlertDescription>{getDashboard.error?.response?.data?.ErrorDescription}</AlertDescription>
                  }
                </Box>
              </Alert>
            </Center>
          )}
          {getDashboard.data && (
            <Masonry
              breakpointCols={{
                default: 3,
                1800: 3,
                1400: 2,
                800: 1,
              }}
              className="my-masonry-grid"
              columnClassName="my-masonry-grid_column"
            >
              <SimpleIconStatDisplay
                title={t('devices.title')}
                value={getDashboard.data?.numberOfDevices ?? 0}
                description={t('controller.dashboard.devices_explanation')}
                icon={WifiHigh}
                color={['blue.300', 'blue.300']}
              />
              <OverallHealthSimple data={getDashboard.data.healths} />
              <MemorySimpleChart data={getDashboard.data.memoryUsed} />
              <ConnectedPieChart data={getDashboard.data} />
              <OverallHealthPieChart data={getDashboard.data.healths} />
              <UptimesBarChart data={getDashboard.data.upTimes} />
              <VendorBarChart data={getDashboard.data.vendors} />
              <AssociationsPieChart data={getDashboard.data.associations} />
              <MemoryBarChart data={getDashboard.data.memoryUsed} />
              <DeviceTypesPieChart data={getDashboard.data.deviceType} />
              <CommandsBarChart data={getDashboard.data.commands} />
              <CertificatesPieChart data={getDashboard.data.certificates} />
            </Masonry>
          )}
        </>
      </Box>
    </>
  );
};

export default DevicesDashboard;
