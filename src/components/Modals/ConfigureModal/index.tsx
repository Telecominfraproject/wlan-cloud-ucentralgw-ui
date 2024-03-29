import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { ClipboardText } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { SaveButton } from '../../Buttons/SaveButton';
import { Modal } from '../Modal';
import { FileInputButton } from 'components/Buttons/FileInputButton';
import { useConfigureDevice } from 'hooks/Network/Commands';
import { useGetDevice } from 'hooks/Network/Devices';
import { AxiosError } from 'models/Axios';

export type ConfigureModalProps = {
  serialNumber: string;
  modalProps: {
    isOpen: boolean;
    onClose: () => void;
  };
};

const _ConfigureModal = ({ serialNumber, modalProps }: ConfigureModalProps) => {
  const { t } = useTranslation();
  const toast = useToast();
  const configure = useConfigureDevice({ serialNumber });
  const getDevice = useGetDevice({ serialNumber });

  const [newConfig, setNewConfig] = React.useState('');

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewConfig(e.target.value);
  }, []);

  const onImportConfiguration = () => {
    setNewConfig(getDevice.data?.configuration ? JSON.stringify(getDevice.data.configuration, null, 4) : '');
  };

  const isValid = React.useMemo(() => {
    try {
      JSON.parse(newConfig);
      return true;
    } catch (error) {
      return false;
    }
  }, [newConfig]);

  const onSave = () => {
    try {
      const config = JSON.parse(newConfig);
      configure.mutate(config, {
        onSuccess: (data) => {
          if (data.errorCode === 0) {
            toast({
              id: `configure-success-${serialNumber}`,
              title: t('common.success'),
              description:
                data.status === 'pending'
                  ? 'Command is pending! It will execute once the device connects'
                  : t('controller.configure.success'),
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            modalProps.onClose();
          } else if (data.errorCode === 1) {
            toast({
              id: `configure-warning-${serialNumber}`,
              title: 'Warning',
              description: `${data?.errorText ?? 'Unknown Warning'}`,
              status: 'warning',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            modalProps.onClose();
          } else {
            toast({
              id: `config-error-${serialNumber}`,
              title: t('common.error'),
              description: `${data?.errorText ?? 'Unknown Error'} (Code ${data.errorCode})`,
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
          modalProps.onClose();
        },
      });
    } catch (e) {
      // do nothing
    }
  };

  React.useEffect(() => {
    if (modalProps.isOpen) {
      getDevice.refetch();
    } else {
      setNewConfig('');
    }
  }, [modalProps.isOpen]);

  return (
    <Modal
      {...modalProps}
      title={t('controller.configure.title')}
      topRightButtons={
        <SaveButton onClick={onSave} isDisabled={!isValid || newConfig.length === 0} isLoading={configure.isLoading} />
      }
    >
      <>
        {configure.error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <Box>
              <AlertTitle>{t('common.error')}</AlertTitle>
              <AlertDescription>{(configure.error as AxiosError)?.response?.data?.ErrorDescription}</AlertDescription>
            </Box>
          </Alert>
        )}
        <Alert status="warning" mb={2}>
          <AlertIcon />
          <AlertDescription>{t('controller.configure.warning')}</AlertDescription>
        </Alert>
        <FormControl isInvalid={!isValid && newConfig.length > 0}>
          <FormLabel>{t('configurations.one')}</FormLabel>
          <Flex mb={2}>
            <Box w="240px">
              <FileInputButton
                value={newConfig}
                setValue={(v) => setNewConfig(v)}
                refreshId="1"
                accept=".json"
                isStringFile
              />
            </Box>
            <Button
              rightIcon={<ClipboardText size={20} />}
              onClick={onImportConfiguration}
              hidden={!getDevice.data}
              ml={2}
            >
              Current Configuration
            </Button>
          </Flex>
          <Textarea height="auto" minH="600px" value={newConfig} onChange={onChange} />
          <FormErrorMessage>{t('controller.configure.invalid')}</FormErrorMessage>
        </FormControl>
      </>
    </Modal>
  );
};

export const ConfigureModal = React.memo(_ConfigureModal);
