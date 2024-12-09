import * as React from 'react';
import { IconButton, Tooltip, useToast } from '@chakra-ui/react';
import { Power, PlugsConnected } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { usePowerCycle } from 'hooks/Network/Devices';
import { useNotification } from 'hooks/useNotification';
import { DeviceLinkState } from 'hooks/Network/Statistics';
import { CableDiagnosticsModalProps } from 'components/Modals/CableDiagnosticsModal';

type Props = {
  state: DeviceLinkState & { name: string };
  deviceSerialNumber: string;
  onOpenCableDiagnostics: (port: string) => void;
};

const LinkStateTableActions = ({ state, deviceSerialNumber, onOpenCableDiagnostics }: Props) => {
  const { t } = useTranslation();
  const powerCycle = usePowerCycle();
  const toast = useToast();
  const { successToast, apiErrorToast } = useNotification();

  const onPowerCycle = () => {
    powerCycle.mutate(
      { serial: deviceSerialNumber, when: 0, ports: [{ name: state.name, cycle: 10 * 1000 }] },
      {
        onSuccess: (data) => {
          if (data.errorCode === 0) {
            successToast({
              description: `Power cycle started for port ${state.name} for 10s`,
            });
          } else if (data.errorCode === 1) {
            toast({
              id: `powercycle-warning-${deviceSerialNumber}`,
              title: 'Warning',
              description: `${data?.errorText ?? 'Unknown Warning'}`,
              status: 'warning',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          } else {
            toast({
              id: `powercycle-error-${deviceSerialNumber}`,
              title: t('common.error'),
              description: `${data?.errorText ?? 'Unknown Error'} (Code ${data.errorCode})`,
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
        },
        onError: (e) => apiErrorToast({ e }),
      },
    );
  };

  return (
    <>
      <Tooltip label="Power Cycle" placement="auto-start">
        <IconButton
          aria-label="Power Cycle"
          icon={<Power size={20} />}
          colorScheme="green"
          onClick={onPowerCycle}
          isLoading={powerCycle.isLoading}
          size="xs"
        />
      </Tooltip>
      <Tooltip label="Cable Diagnostics" placement="auto-start">
        <IconButton
          aria-label="Cable Diagnostics"
          icon={<PlugsConnected size={20} />}
          colorScheme="blue"
          onClick={() => onOpenCableDiagnostics(state.name)}
          size="xs"
        />
      </Tooltip>
    </>
  );
};

export default LinkStateTableActions;
