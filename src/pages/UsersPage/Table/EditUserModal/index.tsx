import * as React from 'react';
import { useEffect } from 'react';
import { Spinner, Center, useDisclosure, useBoolean } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { EditButton } from '../../../../components/Buttons/EditButton';
import { SaveButton } from '../../../../components/Buttons/SaveButton';
import { ConfirmCloseAlertModal } from '../../../../components/Modals/ConfirmCloseAlert';
import { Modal } from '../../../../components/Modals/Modal';
import UpdateUserForm from './Form';
import { useGetUser, User } from 'hooks/Network/Users';
import { useFormRef } from 'hooks/useFormRef';

type Props = {
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
};

const EditUserModal = ({ isOpen, onClose, userId }: Props) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useBoolean();
  const { isOpen: showConfirm, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();
  const { form, formRef } = useFormRef<User>();
  const canFetchUser = userId !== '' && isOpen;
  const { data: user, isFetching } = useGetUser({ id: userId ?? '', enabled: canFetchUser });

  const closeModal = () => (form.dirty ? openConfirm() : onClose());

  const closeCancelAndForm = () => {
    closeConfirm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) setEditing.off();
  }, [isOpen]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title={t('crud.edit_obj', { obj: t('user.title') })}
        topRightButtons={
          <>
            <SaveButton
              onClick={form.submitForm}
              isLoading={form.isSubmitting}
              isDisabled={!editing || !form.isValid || !form.dirty}
            />
            <EditButton ml={2} isDisabled={editing} onClick={setEditing.toggle} isCompact />
          </>
        }
      >
        {!isFetching && user ? (
          <UpdateUserForm editing={editing} selectedUser={user} isOpen={isOpen} onClose={onClose} formRef={formRef} />
        ) : (
          <Center>
            <Spinner />
          </Center>
        )}
      </Modal>
      <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export default EditUserModal;
