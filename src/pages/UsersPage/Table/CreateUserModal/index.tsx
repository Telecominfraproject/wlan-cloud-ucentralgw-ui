import * as React from 'react';
import { useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SaveButton } from '../../../../components/Buttons/SaveButton';
import { ConfirmCloseAlertModal } from '../../../../components/Modals/ConfirmCloseAlert';
import { Modal } from '../../../../components/Modals/Modal';
import CreateUserForm, { CreateUserFormValues } from './Form';
import { CreateButton } from 'components/Buttons/CreateButton';
import { useAuth } from 'contexts/AuthProvider';
import { useFormRef } from 'hooks/useFormRef';

const CreateUserModal = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: showConfirm, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();
  const { form, formRef } = useFormRef<CreateUserFormValues>();

  const closeModal = () => (form.dirty ? openConfirm() : onClose());

  const closeCancelAndForm = () => {
    closeConfirm();
    onClose();
  };

  return (
    <>
      {user?.userRole === 'CSR' ? null : <CreateButton onClick={onOpen} ml={2} />}
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={t('crud.create_object', { obj: t('user.title') })}
        topRightButtons={
          <SaveButton
            onClick={form.submitForm}
            isLoading={form.isSubmitting}
            isDisabled={!form.isValid || !form.dirty}
          />
        }
      >
        <CreateUserForm isOpen={isOpen} onClose={onClose} formRef={formRef} />
      </Modal>
      <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export default CreateUserModal;
