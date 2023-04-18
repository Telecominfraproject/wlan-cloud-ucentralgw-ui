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

export const ConfigureModal = ({ serialNumber, modalProps }: ConfigureModalProps) => {
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
        onSuccess: () => {
          toast({
            id: `configure-success-${serialNumber}`,
            title: t('common.success'),
            description: t('controller.configure.success'),
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
          modalProps.onClose();
        },
      });
    } catch (e) {}
  };

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
