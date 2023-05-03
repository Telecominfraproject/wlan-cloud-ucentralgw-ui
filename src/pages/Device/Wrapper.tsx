import * as React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  HStack,
  Portal,
  Spacer,
  useBreakpoint,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Circuitry, Heart, HeartBreak, LockSimple, LockSimpleOpen, WifiHigh, WifiSlash } from '@phosphor-icons/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { useNavigate } from 'react-router-dom';
import DeviceDetails from './Details';
import DeviceLogsCard from './LogsCard';
import DeviceNotes from './Notes';
import RadiusClientsCard from './RadiusClients';
import RestrictionsCard from './RestrictionsCard';
import DeviceStatisticsCard from './StatisticsCard';
import DeviceSummary from './Summary';
import WifiAnalysisCard from './WifiAnalysis';
import { DeleteButton } from 'components/Buttons/DeleteButton';
import DeviceActionDropdown from 'components/Buttons/DeviceActionDropdown';
import { RefreshButton } from 'components/Buttons/RefreshButton';
import { Card } from 'components/Containers/Card';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { ResponsiveTag } from 'components/Containers/ResponsiveTag';
import GlobalSearchBar from 'components/GlobalSearchBar';
import { ConfigureModal } from 'components/Modals/ConfigureModal';
import { EventQueueModal } from 'components/Modals/EventQueueModal';
import FactoryResetModal from 'components/Modals/FactoryResetModal';
import { FirmwareUpgradeModal } from 'components/Modals/FirmwareUpgradeModal';
import { RebootModal } from 'components/Modals/RebootModal';
import { useScriptModal } from 'components/Modals/ScriptModal/useScriptModal';
import { TelemetryModal } from 'components/Modals/TelemetryModal';
import { TraceModal } from 'components/Modals/TraceModal';
import { WifiScanModal } from 'components/Modals/WifiScanModal';
import { useDeleteDevice, useGetDevice, useGetDeviceHealthChecks, useGetDeviceStatus } from 'hooks/Network/Devices';

type Props = {
  serialNumber: string;
};

const DevicePageWrapper = ({ serialNumber }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const breakpoint = useBreakpoint();
  const cancelRef = React.useRef(null);
  const navigate = useNavigate();
  const { mutateAsync: deleteDevice, isLoading: isDeleting } = useDeleteDevice({
    serialNumber,
  });
  const getDevice = useGetDevice({ serialNumber });
  const getStatus = useGetDeviceStatus({ serialNumber });
  const getHealth = useGetDeviceHealthChecks({ serialNumber, limit: 1 });
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const scanModalProps = useDisclosure();
  const resetModalProps = useDisclosure();
  const eventQueueProps = useDisclosure();
  const configureModalProps = useDisclosure();
  const upgradeModalProps = useDisclosure();
  const telemetryModalProps = useDisclosure();
  const traceModalProps = useDisclosure();
  const rebootModalProps = useDisclosure();
  const scriptModal = useScriptModal();
  // Sticky-top styles
  const isCompact = breakpoint === 'base' || breakpoint === 'sm' || breakpoint === 'md';
  const boxShadow = useColorModeValue('0px 7px 23px rgba(0, 0, 0, 0.05)', 'none');

  const handleDeleteClick = () =>
    deleteDevice(serialNumber, {
      onSuccess: () => {
        toast({
          id: `delete-device-success-${serialNumber}`,
          title: t('common.success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        navigate('/devices');
      },
      onError: (e) => {
        if (axios.isAxiosError(e)) {
          toast({
            id: `delete-device-error-${serialNumber}`,
            title: t('common.error'),
            description: e.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
        }
      },
    });

  const connectedTag = React.useMemo(() => {
    if (!getStatus.data) return null;

    return (
      <ResponsiveTag
        label={getStatus?.data?.connected ? t('common.connected') : t('common.disconnected')}
        colorScheme={getStatus?.data?.connected ? 'green' : 'red'}
        icon={getStatus.data.connected ? WifiHigh : WifiSlash}
      />
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
      <ResponsiveTag
        label={sanity ? `${sanity}%` : t('common.unknown')}
        colorScheme={color}
        icon={color === 'green' ? Heart : HeartBreak}
      />
    );
  }, [getStatus.data, getHealth.data]);

  const restrictedTag = React.useMemo(() => {
    if (!getDevice.data || !getDevice.data.restrictedDevice) return null;

    if (getDevice.data.restrictionDetails?.developer)
      return (
        <ResponsiveTag
          label={`${t('devices.restricted')} ${isCompact ? '' : '(Dev Mode)'}`}
          tooltip={t('devices.restricted_overriden')}
          colorScheme="green"
          icon={LockSimpleOpen}
        />
      );

    return (
      <ResponsiveTag
        label={t('devices.restricted')}
        tooltip={t('devices.restricted')}
        colorScheme="red"
        icon={LockSimple}
      />
    );
  }, [getDevice.data, isCompact]);

  const refresh = () => {
    getDevice.refetch();
    getStatus.refetch();
    getHealth.refetch();
  };

  return (
    <>
      {isCompact ? (
        <Card mb={4}>
          <CardHeader variant="unstyled" p="8px">
            <HStack spacing={2}>
              {getDevice.data?.simulated ? (
                <ResponsiveTag label={t('simulation.simulated')} colorScheme="purple" icon={Circuitry} />
              ) : null}
              {connectedTag}
              {healthTag}
              {restrictedTag}
              <GlobalSearchBar />
            </HStack>
            <Spacer />
            <HStack spacing={2}>
              <DeleteButton isCompact onClick={onDeleteOpen} />
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
                  onOpenScriptModal={scriptModal.openModal}
                  onOpenRebootModal={rebootModalProps.onOpen}
                  size="md"
                  isCompact
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
        </Card>
      ) : (
        <Portal appendToParentPortal={false}>
          <Card
            mb={4}
            top="100px"
            position="fixed"
            w="calc(100% - 255px)"
            right={{ base: '0px', sm: '0px', lg: '20px' }}
            boxShadow={boxShadow}
            p="8px"
          >
            <CardHeader variant="unstyled">
              <HStack spacing={2}>
                {getDevice.data?.simulated ? (
                  <ResponsiveTag label={t('simulation.simulated')} colorScheme="purple" icon={Circuitry} />
                ) : null}
                {connectedTag}
                {healthTag}
                {restrictedTag}
                <GlobalSearchBar />
              </HStack>
              <Spacer />
              <HStack spacing={2}>
                <DeleteButton isCompact onClick={onDeleteOpen} />
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
                    onOpenRebootModal={rebootModalProps.onOpen}
                    onOpenScriptModal={scriptModal.openModal}
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
          </Card>
        </Portal>
      )}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t('crud.delete')} {serialNumber}
            </AlertDialogHeader>

            <AlertDialogBody>{t('crud.delete_confirm', { obj: t('devices.one') })}</AlertDialogBody>

            <AlertDialogFooter>
              <Button colorScheme="gray" mr="1" onClick={onDeleteClose} ref={cancelRef}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={isDeleting}>
                {t('common.yes')}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      <WifiScanModal modalProps={scanModalProps} serialNumber={serialNumber} />
      <FirmwareUpgradeModal modalProps={upgradeModalProps} serialNumber={serialNumber} />
      <FactoryResetModal modalProps={resetModalProps} serialNumber={serialNumber} />
      <TraceModal serialNumber={serialNumber} modalProps={traceModalProps} />
      <EventQueueModal serialNumber={serialNumber} modalProps={eventQueueProps} />
      <ConfigureModal serialNumber={serialNumber} modalProps={configureModalProps} />
      <TelemetryModal serialNumber={serialNumber} modalProps={telemetryModalProps} />
      <RebootModal serialNumber={serialNumber} modalProps={rebootModalProps} />
      {scriptModal.modal}
      <Box mt={isCompact ? '0px' : '68px'}>
        <Masonry
          breakpointCols={{
            default: 2,
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
          {getDevice.data && getDevice.data?.hasRADIUSSessions > 0 ? (
            <RadiusClientsCard serialNumber={serialNumber} />
          ) : null}
          <RestrictionsCard serialNumber={serialNumber} />
          <Box />
          <DeviceNotes serialNumber={serialNumber} />
        </Masonry>
      </Box>
    </>
  );
};

export default DevicePageWrapper;
