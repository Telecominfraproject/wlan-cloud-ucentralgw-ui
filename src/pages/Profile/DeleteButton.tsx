import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { DeleteButton } from '../../components/Buttons/DeleteButton';
import { Modal } from '../../components/Modals/Modal';
import { useAuth } from 'contexts/AuthProvider';
import { useDeleteUser } from 'hooks/Network/Users';

type Props = {
  isDisabled?: boolean;
};
const DeleteProfileButton = ({ isDisabled }: Props) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const deleteUser = useDeleteUser();
  const modalProps = useDisclosure();

  const onDeleteClick = () =>
    deleteUser.mutate(user?.id ?? '', {
      onSuccess: () => {
        setTimeout(() => {
          logout();
        }, 3000);
      },
    });

  const onOpen = () => {
    deleteUser.reset();
    modalProps.onOpen();
  };
  return (
    <>
      <DeleteButton isCompact isDisabled={isDisabled} onClick={onOpen} />
      <Modal {...modalProps} title={t('profile.delete_account')}>
        <Box>
          {deleteUser.isSuccess ? (
            <Center>
              <Alert status="success">
                <AlertIcon />
                <AlertDescription>
                  {t('Your profile is now deleted, we will now log you out...')} <Spinner />
                </AlertDescription>
              </Alert>
            </Center>
          ) : (
            <>
              <Center>
                {deleteUser.error ? (
                  <Alert status="error">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>{t('common.error')}</AlertTitle>
                      <AlertDescription>
                        {axios.isAxiosError(deleteUser.error) ? deleteUser.error.response?.data?.ErrorDescription : ''}
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertDescription>{t('profile.delete_warning')}</AlertDescription>
                  </Alert>
                )}
              </Center>
              <Center my={8}>
                <Button onClick={onDeleteClick} isLoading={deleteUser.isLoading} colorScheme="red">
                  {t('profile.delete_account_confirm')}
                </Button>
              </Center>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default DeleteProfileButton;
