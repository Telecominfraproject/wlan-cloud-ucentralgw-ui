import * as React from 'react';
import { Box, Heading, HStack, Spacer, Tag, TagLabel, TagLeftIcon, Tooltip, useDisclosure } from '@chakra-ui/react';
import { Heart, HeartBreak, WifiHigh, WifiSlash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import DeviceDetails from './Details';
import DeviceLogsCard from './LogsCard';
import DeviceNotes from './Notes';
import DeviceStatisticsCard from './StatisticsCard';
import DeviceSummary from './Summary';
import WifiAnalysisCard from './WifiAnalysis';
import DeviceActionDropdown from 'components/Buttons/DeviceActionDropdown';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import FormattedDate from 'components/InformationDisplays/FormattedDate';
import { ConfigureModal } from 'components/Modals/ConfigureModal';
import { EventQueueModal } from 'components/Modals/EventQueueModal';
import FactoryResetModal from 'components/Modals/FactoryResetModal';
import { FirmwareUpgradeModal } from 'components/Modals/FirmwareUpgradeModal';
import { TelemetryModal } from 'components/Modals/TelemetryModal';
import { TraceModal } from 'components/Modals/TraceModal';
import { WifiScanModal } from 'components/Modals/WifiScanModal';
import { useGetDevice, useGetDeviceHealthChecks, useGetDeviceStatus } from 'hooks/Network/Devices';

type Props = {
  serialNumber: string;
};

const DevicePageWrapper = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const getDevice = useGetDevice({ serialNumber });
  const getStatus = useGetDeviceStatus({ serialNumber });
  const getHealth = useGetDeviceHealthChecks({ serialNumber, limit: 1 });
  const scanModalProps = useDisclosure();
  const resetModalProps = useDisclosure();
  const eventQueueProps = useDisclosure();
  const configureModalProps = useDisclosure();
  const upgradeModalProps = useDisclosure();
  const telemetryModalProps = useDisclosure();
  const traceModalProps = useDisclosure();

  const connectedTag = React.useMemo(() => {
    if (!getStatus.data) return null;

    return (
      <Tag size="lg" colorScheme={getStatus?.data?.connected ? 'green' : 'red'}>
        <TagLeftIcon boxSize="18px" as={getStatus.data.connected ? WifiHigh : WifiSlash} />
        <TagLabel>{getStatus?.data?.connected ? t('common.connected') : t('common.disconnected')}</TagLabel>
      </Tag>
    );
  }, [getStatus.data]);

  const healthTag = React.useMemo(() => {
    if (!getStatus.data || !getStatus.data.connected || !getHealth.data || getHealth.data?.values?.length === 0)
      return null;

    let color = 'red';
    let sanity: number | undefined;
    if (getHealth.data?.values?.[0]) {
      const { sanity: sanityValue } = getHealth.data.values[0];
      sanity = sanityValue;
      if (sanityValue === 100) color = 'green';
      else if (sanityValue > 80) color = 'yellow';
    }

    return (
      <Tooltip
        hasArrow
        label={
          getHealth.data?.values?.[0]?.recorded !== undefined ? (
            <FormattedDate date={getHealth.data?.values?.[0]?.recorded} />
          ) : (
            ''
          )
        }
      >
        <Tag size="lg" colorScheme={color}>
          <TagLeftIcon boxSize="18px" as={color === 'green' ? Heart : HeartBreak} />
          <TagLabel>{sanity ? `${sanity}%` : t('common.unknown')}</TagLabel>
        </Tag>
      </Tooltip>
    );
  }, [getStatus.data, getHealth.data]);

  const refresh = () => {
    getDevice.refetch();
    getStatus.refetch();
    getHealth.refetch();
  };

  return (
    <>
      <Card p={2} mb={4}>
        <CardHeader>
          <HStack spacing={2}>
            <Heading size="md">{serialNumber}</Heading>
            {connectedTag}
            {healthTag}
          </HStack>
          <Spacer />
          <HStack spacing={2}>
            {getDevice?.data && (
              <DeviceActionDropdown
                // @ts-ignore
                device={getDevice?.data}
                refresh={refresh}
                onOpenScan={scanModalProps.onOpen}
                onOpenFactoryReset={resetModalProps.onOpen}
                onOpenUpgradeModal={upgradeModalProps.onOpen}
                onOpenTrace={traceModalProps.onOpen}
                onOpenEventQueue={eventQueueProps.onOpen}
                onOpenConfigureModal={configureModalProps.onOpen}
                onOpenTelemetryModal={telemetryModalProps.onOpen}
                size="md"
              />
            )}
            <RefreshButton
              onClick={refresh}
              isFetching={getDevice.isFetching || getHealth.isFetching || getStatus.isFetching}
              isCompact
              // @ts-ignore
              colorScheme="blue"
            />
          </HStack>
        </CardHeader>
        <WifiScanModal modalProps={scanModalProps} serialNumber={serialNumber} />
        <FirmwareUpgradeModal modalProps={upgradeModalProps} serialNumber={serialNumber} />
        <FactoryResetModal modalProps={resetModalProps} serialNumber={serialNumber} />
        <TraceModal serialNumber={serialNumber} modalProps={traceModalProps} />
        <EventQueueModal serialNumber={serialNumber} modalProps={eventQueueProps} />
        <ConfigureModal serialNumber={serialNumber} modalProps={configureModalProps} />
        <TelemetryModal serialNumber={serialNumber} modalProps={telemetryModalProps} />
      </Card>
      <Box marginLeft="10px">
        <Masonry
          breakpointCols={{
            default: 3,
            2200: 2,
            1100: 1,
          }}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          <DeviceSummary serialNumber={serialNumber} />
          <DeviceDetails serialNumber={serialNumber} />
          <DeviceStatisticsCard serialNumber={serialNumber} />
          <WifiAnalysisCard serialNumber={serialNumber} />
          <DeviceLogsCard serialNumber={serialNumber} />
          <DeviceNotes serialNumber={serialNumber} />
        </Masonry>
      </Box>
    </>
  );
};

export default DevicePageWrapper;
