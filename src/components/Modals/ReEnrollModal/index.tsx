import React from 'react';
import { Center, Spinner, Alert, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Modal } from '../Modal';
import { useReEnroll } from 'hooks/Network/ReEnroll';
import { ModalProps } from 'models/Modal';

interface Props {
  modalProps: ModalProps;
  serialNumber: string;
}

const ReEnrollModal = ({ modalProps: { isOpen, onClose }, serialNumber }: Props) => {
  const { t } = useTranslation();
  const { mutate: reEnroll, isLoading } = useReEnroll({ serialNumber });

  const submit = () => {
    reEnroll(
      { serialNumber, when: 0 },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('controller.devices.re_enroll')}>
      {isLoading ? (
        <Center>
          <Spinner size="lg" />
        </Center>
      ) : (
        <>
          <Alert colorScheme="blue" mb={6}>
            {t('controller.devices.re_enroll_warning', { serialNumber })}
          </Alert>
          <Center mb={6}>
            <Button size="lg" colorScheme="blue" onClick={submit} fontWeight="bold">
              {t('controller.devices.confirm_re_enroll', { serialNumber })}
            </Button>
          </Center>
        </>
      )}
    </Modal>
  );
};

export default ReEnrollModal;