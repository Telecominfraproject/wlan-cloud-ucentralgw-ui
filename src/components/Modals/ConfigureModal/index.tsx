import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SaveButton } from '../../Buttons/SaveButton';
import { Modal } from '../Modal';
import { useConfigureDevice } from 'hooks/Network/Commands';

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
  const [newConfig, setNewConfig] = React.useState('');

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewConfig(e.target.value);
  }, []);
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
    } catch (e) {
      // console.log(e);
    }
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
              {
                // @ts-ignore
                <AlertDescription>{configure.error?.response?.data?.ErrorDescription}</AlertDescription>
              }
            </Box>
          </Alert>
        )}
        <Alert status="warning" mb={2}>
          <AlertIcon />
          <AlertDescription>{t('controller.configure.warning')}</AlertDescription>
        </Alert>
        <FormControl isInvalid={!isValid && newConfig.length > 0}>
          <FormLabel>{t('configurations.one')}</FormLabel>
          <Textarea height="auto" minH="200px" value={newConfig} onChange={onChange} />
          <FormErrorMessage>{t('controller.configure.invalid')}</FormErrorMessage>
        </FormControl>
      </>
    </Modal>
  );
};
