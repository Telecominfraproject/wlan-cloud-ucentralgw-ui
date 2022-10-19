import React, { useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useToast,
  Spinner,
  Center,
  useDisclosure,
  useBoolean,
} from '@chakra-ui/react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import UpdateUserForm from './Form';
import { CloseButton } from 'components/Buttons/CloseButton';
import { EditButton } from 'components/Buttons/EditButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { ModalHeader } from 'components/Modals/GenericModal/ModalHeader';
import { axiosSec } from 'constants/axiosInstances';
import { useGetUser } from 'hooks/Network/Users';
import { useFormRef } from 'hooks/useFormRef';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  userId: PropTypes.string,
  requirements: PropTypes.shape({
    accessPolicy: PropTypes.string,
    passwordPolicy: PropTypes.string,
  }),
  refreshUsers: PropTypes.func.isRequired,
};

const defaultProps = {
  userId: '',
  requirements: {
    accessPolicy: '',
    passwordPolicy: '',
  },
};

const EditUserModal = ({ isOpen, onClose, userId, requirements, refreshUsers }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useBoolean();
  const { isOpen: showConfirm, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure();
  const toast = useToast();
  const { form, formRef } = useFormRef();
  const canFetchUser = userId !== '' && isOpen;
  const { data: user, isLoading } = useGetUser({ t, toast, id: userId, enabled: canFetchUser });
  const createUser = useMutation((userInfo) => axiosSec.put(`user/${userId}`, userInfo));

  const closeModal = () => (form.dirty ? openConfirm() : onClose());

  const closeCancelAndForm = () => {
    closeConfirm();
    onClose();
  };

  useEffect(() => {
    if (isOpen) setEditing.off();
  }, [isOpen]);

  return (
    <Modal onClose={closeModal} isOpen={isOpen} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxWidth={{ sm: '600px', md: '700px', lg: '800px', xl: '50%' }}>
        <ModalHeader
          title={t('crud.edit_obj', { obj: t('user.title') })}
          right={
            <>
              <SaveButton
                onClick={form.submitForm}
                isLoading={form.isSubmitting}
                isDisabled={!editing || !form.isValid || !form.dirty}
              />
              <EditButton ml={2} isDisabled={editing} onClick={setEditing.toggle} isCompact />
              <CloseButton ml={2} onClick={closeModal} />
            </>
          }
        />
        <ModalBody>
          {!isLoading && user ? (
            <UpdateUserForm
              editing={editing}
              userToUpdate={user}
              requirements={requirements}
              updateUser={createUser}
              isOpen={isOpen}
              onClose={onClose}
              refreshUsers={refreshUsers}
              formRef={formRef}
            />
          ) : (
            <Center>
              <Spinner />
            </Center>
          )}
        </ModalBody>
      </ModalContent>
      <ConfirmCloseAlertModal isOpen={showConfirm} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </Modal>
  );
};

EditUserModal.propTypes = propTypes;
EditUserModal.defaultProps = defaultProps;

export default EditUserModal;
