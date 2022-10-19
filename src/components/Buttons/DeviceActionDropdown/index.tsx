import React from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Spinner, Tooltip } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { Wrench } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import RebootMenuItem from './RebootButton';
import { useBlinkDevice, useGetDeviceRtty } from 'hooks/Network/Devices';
import { useMutationResult } from 'hooks/useMutationResult';
import { GatewayDevice } from 'models/Device';

interface Props {
  device: GatewayDevice;
  refresh: () => void;
  isDisabled?: boolean;
  onOpenScan: (serialNumber: string) => void;
  onOpenFactoryReset: (serialNumber: string) => void;
  onOpenUpgradeModal: (serialNumber: string) => void;
  onOpenTrace: (serialNumber: string) => void;
  onOpenEventQueue: (serialNumber: string) => void;
  onOpenConfigureModal: (serialNumber: string) => void;
  onOpenTelemetryModal: (serialNumber: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const DeviceActionDropdown = ({
  device,
  refresh,
  isDisabled,
  onOpenScan,
  onOpenFactoryReset,
  onOpenTrace,
  onOpenUpgradeModal,
  onOpenEventQueue,
  onOpenTelemetryModal,
  onOpenConfigureModal,
  size,
}: Props) => {
  const { t } = useTranslation();
  const { refetch: getRtty, isLoading: isRtty } = useGetDeviceRtty({
    serialNumber: device.serialNumber,
    extraId: 'inventory-modal',
  });
  const { mutateAsync: blink } = useBlinkDevice({ serialNumber: device.serialNumber });
  const { onSuccess: onBlinkSuccess, onError: onBlinkError } = useMutationResult({
    objName: t('devices.one'),
    operationType: 'blink',
    refresh,
  });

  const handleBlinkClick = () => {
    blink(undefined, {
      onError: (e) => {
        onBlinkError(e as AxiosError);
      },
    });
    onBlinkSuccess();
  };
  const handleOpenScan = () => onOpenScan(device.serialNumber);
  const handleOpenFactoryReset = () => onOpenFactoryReset(device.serialNumber);
  const handleOpenUpgrade = () => onOpenUpgradeModal(device.serialNumber);
  const handleOpenTrace = () => onOpenTrace(device.serialNumber);
  const handleOpenQueue = () => onOpenEventQueue(device.serialNumber);
  const handleOpenConfigure = () => onOpenConfigureModal(device.serialNumber);
  const handleOpenTelemetry = () => onOpenTelemetryModal(device.serialNumber);
  const handleConnectClick = () => getRtty();

  return (
    <Menu>
      <Tooltip label={t('commands.other')}>
        <MenuButton
          as={IconButton}
          aria-label="Commands"
          icon={isRtty ? <Spinner /> : <Wrench size={20} />}
          size={size ?? 'sm'}
          isDisabled={isDisabled}
          ml={2}
        />
      </Tooltip>
      <MenuList>
        <MenuItem onClick={handleBlinkClick}>{t('commands.blink')}</MenuItem>
        <MenuItem onClick={handleOpenConfigure}>{t('controller.configure.title')}</MenuItem>
        <MenuItem onClick={handleConnectClick}>{t('commands.connect')}</MenuItem>
        <MenuItem onClick={handleOpenQueue}>{t('controller.queue.title')}</MenuItem>
        <MenuItem onClick={handleOpenFactoryReset}>{t('commands.factory_reset')}</MenuItem>
        <MenuItem onClick={handleOpenUpgrade}>{t('commands.firmware_upgrade')}</MenuItem>
        <RebootMenuItem device={device} refresh={refresh} />
        <MenuItem onClick={handleOpenTelemetry}>{t('controller.telemetry.title')}</MenuItem>
        <MenuItem onClick={handleOpenTrace}>{t('controller.devices.trace')}</MenuItem>
        <MenuItem onClick={handleOpenScan}>{t('commands.wifiscan')}</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default React.memo(DeviceActionDropdown);
