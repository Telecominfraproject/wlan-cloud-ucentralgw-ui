import * as React from 'react';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Center, Spacer, Spinner } from '@chakra-ui/react';
import { Clock, WifiHigh } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import AssociationsPieChart from './AssociationsPieChart';
import CertificatesPieChart from './CertificatesPieChart';
import CommandsBarChart from './CommandsBarChart';
import ConnectedPieChart from './ConnectedPieChart';
import DeviceTypesPieChart from './DeviceTypesPieChart';
import MemoryBarChart from './MemoryBarChart';
import OverallHealthSimple from './OverallHealth';
import OverallHealthPieChart from './OverallHealthPieChart';
import UptimesBarChart from './UptimesBarChart';
import VendorBarChart from './VendorBarChart';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { useGetControllerDashboard } from 'hooks/Network/Controller';

const DevicesDashboard = () => {
  const { t } = useTranslation();
  const getDashboard = useGetControllerDashboard();
  return (
    <>
      <CardHeader px={4} pt={4}>
        <Spacer />
        <RefreshButton isCompact onClick={getDashboard.refetch} isFetching={getDashboard.isFetching} />
      </CardHeader>
      <CardBody p={4}>
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
                  1100: 1,
                }}
                className="my-masonry-grid"
                columnClassName="my-masonry-grid_column"
                style={{
                  marginLeft: 'unset',
                }}
              >
                <SimpleIconStatDisplay
                  title={t('analytics.last_ping')}
                  value={<FormattedDate date={getDashboard.data.snapshot ?? 0} />}
                  description={t('controller.dashboard.last_ping_explanation')}
                  icon={Clock}
                  color={['blue.300', 'blue.300']}
                />
                <SimpleIconStatDisplay
                  title={t('devices.title')}
                  value={getDashboard.data?.numberOfDevices ?? 0}
                  description={t('controller.dashboard.devices_explanation')}
                  icon={WifiHigh}
                  color={['green.300', 'green.300']}
                />
                <OverallHealthSimple data={getDashboard.data.healths} />
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
      </CardBody>
    </>
  );
};

export default DevicesDashboard;
