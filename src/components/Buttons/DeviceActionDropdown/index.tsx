import React from 'react';
import { IconButton, Menu, MenuButton, MenuItem, MenuList, Spinner, Tooltip, useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { Wrench } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import RebootMenuItem from './RebootButton';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import { useBlinkDevice, useGetDeviceRtty } from 'hooks/Network/Devices';
import { useUpdateDeviceToLatest } from 'hooks/Network/Firmware';
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
  const toast = useToast();
  const addEventListeners = useControllerStore((state) => state.addEventListeners);
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
  const updateToLatest = useUpdateDeviceToLatest({ serialNumber: device.serialNumber, compatible: device.compatible });

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
  const handleUpdateToLatest = () => {
    updateToLatest.mutate(
      { keepRedirector: true },
      {
        onSuccess: () => {
          toast({
            id: `upgrade-to-latest-start-${device.serialNumber}`,
            title: t('common.success'),
            description: t('controller.devices.sent_upgrade_to_latest'),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
          addEventListeners([
            {
              id: `device-connection-upgrade-${device.serialNumber}`,
              type: 'DEVICE_CONNECTION',
              serialNumber: device.serialNumber,
              callback: () => {
                const id = `device-connection-upgrade-notification-${device.serialNumber}`;

                if (!toast.isActive(id)) {
                  toast({
                    id,
                    title: t('common.success'),
                    description: t('controller.devices.finished_upgrade', { serialNumber: device.serialNumber }),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right',
                  });
                }
              },
            },
            {
              id: `device-disconnected-upgrade-${device.serialNumber}`,
              type: 'DEVICE_DISCONNECTION',
              serialNumber: device.serialNumber,
              callback: () => {
                const id = `device-disconnection-upgrade-notification-${device.serialNumber}`;

                if (!toast.isActive(id)) {
                  toast({
                    id,
                    title: t('common.success'),
                    description: t('controller.devices.started_upgrade', { serialNumber: device.serialNumber }),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right',
                  });
                }
              },
            },
          ]);
        },
        onError: (e) => {
          if (axios.isAxiosError(e)) {
            toast({
              id: `upgrade-to-latest-error-${device.serialNumber}`,
              title: t('common.error'),
              description: e?.response?.data?.ErrorDescription,
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
        },
      },
    );
  };
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
        <MenuItem onClick={handleUpdateToLatest} hidden>
          {t('premium.toolbox.upgrade_to_latest')}
        </MenuItem>
        <MenuItem onClick={handleOpenScan}>{t('commands.wifiscan')}</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default React.memo(DeviceActionDropdown);
