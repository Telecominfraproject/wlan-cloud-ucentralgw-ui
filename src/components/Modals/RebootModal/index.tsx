import * as React from 'react';
import { Alert, AlertIcon, Box, Button, Center, useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { useControllerStore } from 'contexts/ControllerSocketProvider/useStore';
import { useRebootDevice } from 'hooks/Network/Devices';
import { useMutationResult } from 'hooks/useMutationResult';
import { AxiosError } from 'models/Axios';

export type RebootModalProps = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

export const RebootModal = ({ serialNumber, modalProps }: RebootModalProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const addEventListeners = useControllerStore((state) => state.addEventListeners);
  const { mutateAsync: reboot, isLoading } = useRebootDevice({ serialNumber });
  const { onSuccess: onRebootSuccess, onError: onRebootError } = useMutationResult({
    objName: t('devices.one'),
    operationType: 'reboot',
    refresh: () => {
      addEventListeners([
        {
          id: `device-connection-${serialNumber}`,
          type: 'DEVICE_CONNECTION',
          serialNumber,
          callback: () => {
            const id = `device-connection-notification-${serialNumber}`;

            if (!toast.isActive(id)) {
              toast({
                id,
                title: t('common.success'),
                description: t('controller.devices.finished_reboot', { serialNumber }),
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
            }
          },
        },
        {
          id: `device-disconnected-${serialNumber}`,
          type: 'DEVICE_DISCONNECTION',
          serialNumber,
          callback: () => {
            const id = `device-disconnection-notification-${serialNumber}`;

            if (!toast.isActive(id)) {
              toast({
                id,
                title: t('common.success'),
                description: t('controller.devices.started_reboot', { serialNumber }),
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
        modalProps.onClose();
      },
      onError: (e) => {
        onRebootError(e as AxiosError);
      },
    });

  return (
    <Modal
      {...modalProps}
      title={t('commands.reboot')}
      topRightButtons={
        <Button colorScheme="blue" onClick={handleRebootClick} isLoading={isLoading}>
          {t('commands.reboot')}
        </Button>
      }
      options={{
        modalSize: 'sm',
      }}
    >
      <Box>
        <Center mb={2}>
          <Alert status="info" w="unset">
            <AlertIcon />
            {t('commands.reboot_description')}
          </Alert>
        </Center>
      </Box>
    </Modal>
  );
};
