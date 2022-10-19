import React from 'react';
import { useBoolean, Center, Spinner, Alert, FormControl, FormLabel, Switch, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useFactoryReset } from 'hooks/Network/Devices';
import { Modal } from '../Modal';
import { ModalProps } from 'models/Modal';

interface Props {
  modalProps: ModalProps;
  serialNumber: string;
}

const FactoryResetModal = ({ modalProps: { isOpen, onClose }, serialNumber }: Props) => {
  const { t } = useTranslation();
  const [isRedirector, { toggle }] = useBoolean(false);
  const { mutateAsync: factoryReset, isLoading } = useFactoryReset({
    serialNumber,
    keepRedirector: isRedirector,
    onClose,
  });

  const submit = () => {
    factoryReset();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('commands.factory_reset')}>
      {isLoading ? (
        <Center>
          <Spinner size="lg" />
        </Center>
      ) : (
        <>
          <Alert colorScheme="red" mb={6}>
            {t('commands.factory_reset_warning')}
          </Alert>
          <FormControl>
            <FormLabel ms="4px" fontSize="md" fontWeight="normal">
              {t('commands.keep_redirector')}
            </FormLabel>
            <Switch isChecked={isRedirector} onChange={toggle} borderRadius="15px" size="lg" />
          </FormControl>
          <Center mb={6}>
            <Button size="lg" colorScheme="red" onClick={submit} fontWeight="bold">
              {t('commands.confirm_reset', { serialNumber })}
            </Button>
          </Center>
        </>
      )}
    </Modal>
  );
};

export default FactoryResetModal;
