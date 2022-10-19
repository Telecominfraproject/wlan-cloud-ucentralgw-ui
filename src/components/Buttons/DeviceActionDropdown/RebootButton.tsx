import * as React from 'react';
import { MenuItem, useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { GatewayDevice } from 'models/Device';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import { useRebootDevice } from 'hooks/Network/Devices';
import { useMutationResult } from 'hooks/useMutationResult';

type Props = {
  device: GatewayDevice;
  refresh: () => void;
};

const RebootMenuItem = ({ device, refresh }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const addEventListeners = useControllerStore((state) => state.addEventListeners);
  const { mutateAsync: reboot } = useRebootDevice({ serialNumber: device.serialNumber });
  const { onSuccess: onRebootSuccess, onError: onRebootError } = useMutationResult({
    objName: t('devices.one'),
    operationType: 'reboot',
    refresh: () => {
      refresh();
      addEventListeners([
        {
          id: `device-connection-${device.serialNumber}`,
          type: 'DEVICE_CONNECTION',
          serialNumber: device.serialNumber,
          callback: () => {
            const id = `device-connection-notification-${device.serialNumber}`;

            if (!toast.isActive(id)) {
              toast({
                id,
                title: t('common.success'),
                description: t('controller.devices.finished_reboot', { serialNumber: device.serialNumber }),
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
            }
          },
        },
        {
          id: `device-disconnected-${device.serialNumber}`,
          type: 'DEVICE_DISCONNECTION',
          serialNumber: device.serialNumber,
          callback: () => {
            const id = `device-disconnection-notification-${device.serialNumber}`;

            if (!toast.isActive(id)) {
              toast({
                id,
                title: t('common.success'),
                description: t('controller.devices.started_reboot', { serialNumber: device.serialNumber }),
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
  });
  const handleRebootClick = () =>
    reboot(undefined, {
      onSuccess: () => {
        onRebootSuccess();
      },
      onError: (e) => {
        onRebootError(e as AxiosError);
      },
    });

  return <MenuItem onClick={handleRebootClick}>{t('commands.reboot')}</MenuItem>;
};

export default RebootMenuItem;
