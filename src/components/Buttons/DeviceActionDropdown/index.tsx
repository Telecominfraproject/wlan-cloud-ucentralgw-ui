import React from 'react';
import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Portal,
  Tooltip,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { Barcode, Power, TerminalWindow, WifiHigh, Wrench } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
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
  onOpenScriptModal: (device: GatewayDevice) => void;
  onOpenRebootModal: (serialNumber: string) => void;
  onOpenReEnrollModal?: (serialNumber: string) => void;
  onOpenExportModal?: (serialNumber: string) => void;
  size?: 'sm' | 'md' | 'lg';
  isCompact?: boolean;
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
  onOpenScriptModal,
  onOpenRebootModal,
  onOpenReEnrollModal,
  onOpenExportModal,
  size,
  isCompact,
}: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const deviceType = device?.deviceType ?? 'ap';
  const connectColor = useColorModeValue('blackAlpha', 'gray');
  const addEventListeners = useControllerStore((state) => state.addEventListeners);
  const { refetch: getRtty, isFetching: isRtty } = useGetDeviceRtty({
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
        if (axios.isAxiosError(e)) onBlinkError(e);
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
  const handleOpenScript = () => onOpenScriptModal(device);
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
  const handleRebootClick = () => onOpenRebootModal(device.serialNumber);

  return (
    <>
      <Tooltip label={t('commands.connect')}>
        <IconButton
          aria-label="Connect"
          icon={<TerminalWindow size={20} />}
          size={size ?? 'sm'}
          isDisabled={isDisabled}
          isLoading={isRtty}
          onClick={handleConnectClick}
          colorScheme={connectColor}
          hidden={isCompact}
        />
      </Tooltip>
      <Tooltip label={t('controller.configure.title')}>
        <IconButton
          aria-label={t('controller.configure.title')}
          icon={<Barcode size={20} />}
          size={size ?? 'sm'}
          isDisabled={isDisabled}
          onClick={handleOpenConfigure}
          colorScheme="purple"
          hidden={isCompact}
        />
      </Tooltip>
      <Tooltip label={t('commands.reboot')}>
        <IconButton
          aria-label={t('commands.reboot')}
          icon={<Power size={20} />}
          size={size ?? 'sm'}
          isDisabled={isDisabled}
          onClick={handleRebootClick}
          colorScheme="green"
          hidden={isCompact}
        />
      </Tooltip>
      <Tooltip label={t('commands.wifiscan')}>
        <IconButton
          aria-label={t('commands.wifiscan')}
          icon={<WifiHigh size={20} />}
          size={size ?? 'sm'}
          isDisabled={isDisabled}
          onClick={handleOpenScan}
          colorScheme="teal"
          hidden={isCompact || deviceType !== 'ap'}
        />
      </Tooltip>
      <Menu>
        <Tooltip label={t('common.actions')}>
          <MenuButton
            as={IconButton}
            aria-label="Commands"
            icon={<Wrench size={20} />}
            size={size ?? 'sm'}
            isDisabled={isDisabled}
          />
        </Tooltip>
        <Portal>
          <MenuList maxH="315px" overflowY="auto">
            <MenuItem onClick={handleBlinkClick}>{t('commands.blink')}</MenuItem>
            <MenuItem onClick={handleOpenConfigure} hidden={!isCompact || deviceType !== 'ap'}>
              {t('controller.configure.title')}
            </MenuItem>
            <MenuItem onClick={handleConnectClick} hidden={!isCompact}>
              {t('commands.connect')}
            </MenuItem>
            <MenuItem onClick={handleOpenQueue}>{t('controller.queue.title')}</MenuItem>
            <MenuItem onClick={handleOpenFactoryReset}>{t('commands.factory_reset')}</MenuItem>
            <MenuItem onClick={handleOpenUpgrade}>{t('commands.firmware_upgrade')}</MenuItem>
            <MenuItem onClick={handleRebootClick} hidden={!isCompact}>
              {t('commands.reboot')}
            </MenuItem>
            {onOpenReEnrollModal && (
              <MenuItem onClick={() => onOpenReEnrollModal(device.serialNumber)}>
                {t('controller.devices.re_enroll')}
              </MenuItem>
            )}
            <MenuItem onClick={handleOpenTelemetry}>{t('controller.telemetry.title')}</MenuItem>
            <MenuItem onClick={handleOpenScript}>{t('script.one')}</MenuItem>
            <MenuItem onClick={handleOpenTrace}>{t('controller.devices.trace')}</MenuItem>
            <MenuItem onClick={handleUpdateToLatest} hidden>
              {t('premium.toolbox.upgrade_to_latest')}
            </MenuItem>
            <MenuItem onClick={handleOpenScan} hidden={!isCompact || deviceType !== 'ap'}>
              {t('commands.wifiscan')}
            </MenuItem>
            {onOpenExportModal && (
              <MenuItem onClick={() => onOpenExportModal(device.serialNumber)}>
                {t('export.title')}
              </MenuItem>
            )}
          </MenuList>
        </Portal>
      </Menu>
    </>
  );
};

export default React.memo(DeviceActionDropdown);
