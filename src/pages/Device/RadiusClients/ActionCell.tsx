import * as React from 'react';
import { HStack, IconButton, Tooltip, useToast } from '@chakra-ui/react';
import { Eject, MagnifyingGlass } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { RadiusSession, useDisconnectRadiusSession } from 'hooks/Network/Radius';
import { AxiosError } from 'models/Axios';

type Props = {
  session: RadiusSession;
  onAnalysisOpen: (mac: string) => (() => void) | undefined;
};

const DeviceRadiusActions = ({ session, onAnalysisOpen }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const disconnectSession = useDisconnectRadiusSession();

  const handleDisconnect = () => {
    disconnectSession.mutate(session, {
      onSuccess: () => {
        toast({
          id: `radius-disconnect-success`,
          title: t('common.success'),
          description: t('controller.radius.disconnect_success'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e) => {
        toast({
          id: `radius-disconnect-error`,
          title: t('common.error'),
          description: (e as AxiosError)?.response?.data?.ErrorDescription,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  };

  const onOpen = onAnalysisOpen(session.callingStationId);

  return (
    <HStack>
      <Tooltip label={t('controller.radius.disconnect')}>
        <IconButton
          aria-label={t('controller.radius.disconnect')}
          size="sm"
          colorScheme="red"
          icon={<Eject size={20} />}
          onClick={handleDisconnect}
          isLoading={disconnectSession.isLoading}
        />
      </Tooltip>
      <Tooltip label={t('common.view_details')}>
        <IconButton
          aria-label={t('common.view_details')}
          size="sm"
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          onClick={onOpen}
          isDisabled={!onOpen}
        />
      </Tooltip>
    </HStack>
  );
};

export default DeviceRadiusActions;
