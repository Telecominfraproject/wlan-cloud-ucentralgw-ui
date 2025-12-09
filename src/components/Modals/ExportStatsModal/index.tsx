import * as React from 'react';
import {
  Box,
  Button,
  Center,
  Checkbox,
  FormLabel,
  Spinner,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { DownloadSimple } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Modal } from 'components/Modals/Modal';
import { useGetDevice, useGetDeviceHealthChecks, useGetDeviceStatus } from 'hooks/Network/Devices';
import { useGetDeviceLastStats, useGetDeviceNewestStats } from 'hooks/Network/Statistics';
import { useGetTag } from 'hooks/Network/Inventory';
import { useGetCommandHistory } from 'hooks/Network/Commands';
import { useGetDeviceLogs } from 'hooks/Network/DeviceLogs';

type Props = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
  };
};

const ExportStatsModal = ({ serialNumber, modalProps }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([
    'deviceInfo',
    'status',
    'statistics',
  ]);
  const [isExporting, setIsExporting] = React.useState(false);

  const getDevice = useGetDevice({ serialNumber });
  const getStatus = useGetDeviceStatus({ serialNumber });
  const getStats = useGetDeviceLastStats({ serialNumber });
  const getNewestStats = useGetDeviceNewestStats({ serialNumber, limit: 30 });
  const getHealth = useGetDeviceHealthChecks({ serialNumber, limit: 50 });
  const getTag = useGetTag({ serialNumber });
  const getCommands = useGetCommandHistory({ serialNumber, limit: 100 });
  const getLogs = useGetDeviceLogs({ serialNumber, limit: 100, logType: 0 });
  const getCrashes = useGetDeviceLogs({ serialNumber, limit: 100, logType: 1 });
  const getReboots = useGetDeviceLogs({ serialNumber, limit: 100, logType: 2 });

  const onToggle = (value: string) => (e: { target: { checked: boolean } }) => {
    if (e.target.checked) {
      setSelectedOptions([...selectedOptions, value]);
    } else {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== value));
    }
  };

  const buildExportData = React.useCallback(() => {
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      serialNumber,
    };

    if (selectedOptions.includes('deviceInfo') && getDevice.data) {
      exportData.deviceInfo = {
        serialNumber: getDevice.data.serialNumber,
        macAddress: getDevice.data.macAddress,
        manufacturer: getDevice.data.manufacturer,
        deviceType: getDevice.data.deviceType,
        compatible: getDevice.data.compatible,
        firmware: getDevice.data.firmware,
        locale: getDevice.data.locale,
        createdTimestamp: getDevice.data.createdTimestamp,
        modified: getDevice.data.modified,
        lastConfigurationChange: getDevice.data.lastConfigurationChange,
        lastConfigurationDownload: getDevice.data.lastConfigurationDownload,
        lastFWUpdate: getDevice.data.lastFWUpdate,
        lastRecordedContact: getDevice.data.lastRecordedContact,
        certificateExpiryDate: getDevice.data.certificateExpiryDate,
        fwUpdatePolicy: getDevice.data.fwUpdatePolicy,
        restrictedDevice: getDevice.data.restrictedDevice,
        restrictionDetails: getDevice.data.restrictionDetails,
      };
    }

    if (selectedOptions.includes('configuration') && getDevice.data) {
      exportData.configuration = getDevice.data.configuration;
    }

    if (selectedOptions.includes('status') && getStatus.data) {
      exportData.status = {
        connected: getStatus.data.connected,
        connectReason: getStatus.data.connectReason,
        ipAddress: getStatus.data.ipAddress,
        firmware: getStatus.data.firmware,
        lastContact: getStatus.data.lastContact,
        certificateExpiryDate: getStatus.data.certificateExpiryDate,
        certificateIssuerName: getStatus.data.certificateIssuerName,
        started: getStatus.data.started,
        sessionId: getStatus.data.sessionId,
        totalConnectionTime: getStatus.data.totalConnectionTime,
        associations_2G: getStatus.data.associations_2G,
        associations_5G: getStatus.data.associations_5G,
        rxBytes: getStatus.data.rxBytes,
        txBytes: getStatus.data.txBytes,
        messageCount: getStatus.data.messageCount,
      };
    }

    if (selectedOptions.includes('statistics')) {
      if (getStats.data) {
        exportData.lastStatistics = getStats.data;
      }
      if (getNewestStats.data?.data) {
        exportData.statisticsHistory = getNewestStats.data.data.map((stat) => ({
          recorded: stat.recorded,
          UUID: stat.UUID,
          data: stat.data,
        }));
      }
    }

    if (selectedOptions.includes('healthChecks') && getHealth.data?.values) {
      exportData.healthChecks = getHealth.data.values.map((check) => ({
        recorded: check.recorded,
        sanity: check.sanity,
        UUID: check.UUID,
        values: check.values,
      }));
    }

    if (selectedOptions.includes('provisioning') && getTag.data) {
      exportData.provisioning = {
        entity: getTag.data.entity,
        venue: getTag.data.venue,
        subscriber: getTag.data.subscriber,
        extendedInfo: getTag.data.extendedInfo,
      };
    }

    if (selectedOptions.includes('commands') && getCommands.data?.commands) {
      exportData.commands = getCommands.data.commands;
    }

    if (selectedOptions.includes('logs') && getLogs.data?.values) {
      exportData.logs = getLogs.data.values;
    }

    if (selectedOptions.includes('crashes') && getCrashes.data?.values) {
      exportData.crashes = getCrashes.data.values;
    }

    if (selectedOptions.includes('reboots') && getReboots.data?.values) {
      exportData.reboots = getReboots.data.values;
    }

    return exportData;
  }, [selectedOptions, getDevice.data, getStatus.data, getStats.data, getNewestStats.data, getHealth.data, getTag.data, getCommands.data, getLogs.data, getCrashes.data, getReboots.data, serialNumber]);

  const handleExport = () => {
    if (selectedOptions.length === 0) {
      toast({
        id: 'export-no-selection',
        title: t('common.error'),
        description: t('export.select_at_least_one'),
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData = buildExportData();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${serialNumber}-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        id: 'export-success',
        title: t('common.success'),
        description: t('export.success'),
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });

      modalProps.onClose();
    } catch (e) {
      toast({
        id: 'export-error',
        title: t('common.error'),
        description: t('export.error'),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading =
    getDevice.isFetching ||
    getStatus.isFetching ||
    getStats.isFetching ||
    getNewestStats.isFetching ||
    getHealth.isFetching ||
    getTag.isFetching ||
    getCommands.isFetching ||
    getLogs.isFetching ||
    getCrashes.isFetching ||
    getReboots.isFetching;

  return (
    <Modal
      isOpen={modalProps.isOpen}
      onClose={modalProps.onClose}
      title={t('export.title')}
      topRightButtons={
        <Button
          colorScheme="blue"
          leftIcon={<DownloadSimple size={20} />}
          onClick={handleExport}
          isLoading={isExporting}
          isDisabled={selectedOptions.length === 0 || isLoading}
        >
          {t('common.download')}
        </Button>
      }
    >
      <Box>
        {isLoading ? (
          <Center my={8}>
            <Spinner size="xl" />
          </Center>
        ) : (
          <Box>
            <FormLabel>{t('export.select_data')}</FormLabel>
            <Stack spacing={3} mt={2}>
              <Box>
                <Checkbox
                  colorScheme="pink"
                  isChecked={selectedOptions.includes('commands')}
                  onChange={onToggle('commands')}
                >
                  {t('controller.devices.commands')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.commands_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="purple"
                  isChecked={selectedOptions.includes('configuration')}
                  onChange={onToggle('configuration')}
                >
                  {t('configurations.one')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.configuration_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="red"
                  isChecked={selectedOptions.includes('crashes')}
                  onChange={onToggle('crashes')}
                >
                  {t('devices.crash_logs')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.crashes_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="blue"
                  isChecked={selectedOptions.includes('deviceInfo')}
                  onChange={onToggle('deviceInfo')}
                >
                  {t('common.details')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.device_info_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="orange"
                  isChecked={selectedOptions.includes('healthChecks')}
                  onChange={onToggle('healthChecks')}
                >
                  {t('controller.devices.healthchecks')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.health_checks_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="yellow"
                  isChecked={selectedOptions.includes('logs')}
                  onChange={onToggle('logs')}
                >
                  {t('controller.devices.logs')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.logs_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="cyan"
                  isChecked={selectedOptions.includes('provisioning')}
                  onChange={onToggle('provisioning')}
                >
                  {t('controller.provisioning.title')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.provisioning_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="gray"
                  isChecked={selectedOptions.includes('reboots')}
                  onChange={onToggle('reboots')}
                >
                  {t('devices.reboot_logs')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.reboots_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="teal"
                  isChecked={selectedOptions.includes('statistics')}
                  onChange={onToggle('statistics')}
                >
                  {t('configurations.statistics')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.statistics_desc')}
                </Text>
              </Box>
              <Box>
                <Checkbox
                  colorScheme="green"
                  isChecked={selectedOptions.includes('status')}
                  onChange={onToggle('status')}
                >
                  {t('common.status')}
                </Checkbox>
                <Text fontSize="xs" color="gray.500" ml={6}>
                  {t('export.status_desc')}
                </Text>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default React.memo(ExportStatsModal);
