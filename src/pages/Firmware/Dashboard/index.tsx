import * as React from 'react';
import { Alert, AlertDescription, AlertIcon, AlertTitle, Box, Center, Spacer, Spinner } from '@chakra-ui/react';
import { Clock, WifiHigh } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import AverageFirmwareAge from './AverageFirmwareAge';
import ConnectedPieChart from './ConnectedPieChart';
import DeviceTypesPieChart from './DeviceTypesPieChart';
import FirmwareDashboardEndpointDisplay from './EndpointsDisplay';
import FirmwareLatestPieChart from './LatestPieChart';
import OuisBarChart from './OuisBarChart';
import UnknownFirmwareBarChart from './UnknownFirmwareBarChart';
import UpToDateDevicesSimple from './UpToDateDevices';
import SimpleIconStatDisplay from 'components/Containers/SimpleIconStatDisplay';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { useGetFirmwareDashboard } from 'hooks/Network/Firmware';
import { CardBody } from 'components/Containers/Card/CardBody';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { RefreshButton } from 'components/Buttons/RefreshButton';

const FirmwareDashboard = () => {
  const { t } = useTranslation();
  const getDashboard = useGetFirmwareDashboard();
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
                  description={t('controller.firmware.devices_explanation')}
                  icon={WifiHigh}
                  color={['green.300', 'green.300']}
                />
                <UpToDateDevicesSimple data={getDashboard.data} />
                <AverageFirmwareAge data={getDashboard.data} />
                <FirmwareLatestPieChart data={getDashboard.data} />
                <UnknownFirmwareBarChart data={getDashboard.data.unknownFirmwares} />
                <FirmwareDashboardEndpointDisplay data={getDashboard.data.endPoints} />
                <OuisBarChart data={getDashboard.data.ouis} />
                <ConnectedPieChart data={getDashboard.data} />
                <DeviceTypesPieChart data={getDashboard.data.deviceTypes} />
              </Masonry>
            )}
          </>
        </Box>
      </CardBody>
    </>
  );
};

export default FirmwareDashboard;
