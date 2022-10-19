import * as React from 'react';
import { Button, useDisclosure } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import GoogleAuthenticatorModal from './GoogleAuthenticatorModal';
import { useAuth } from 'contexts/AuthProvider';
import { useUpdateAccount } from 'hooks/Network/Account';

const ActivateGoogleAuthenticatorButton = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const updateUser = useUpdateAccount({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  const activate = async () => {
    await updateUser.mutateAsync({
      id: user?.id,
      userTypeProprietaryInfo: {
        mfa: {
          enabled: true,
          method: 'authenticator',
        },
      },
    });
  };

  return (
    <>
      <Button colorScheme="gray" variant="outline" onClick={onOpen}>
        {t('profile.activate')}
      </Button>
      <GoogleAuthenticatorModal isOpen={isOpen} onClose={onClose} onSuccess={activate} />
    </>
  );
};

export default ActivateGoogleAuthenticatorButton;
