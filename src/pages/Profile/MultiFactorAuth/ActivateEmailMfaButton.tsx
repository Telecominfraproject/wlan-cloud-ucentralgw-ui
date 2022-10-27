import * as React from 'react';
import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts/AuthProvider';
import { useUpdateAccount } from 'hooks/Network/Account';

const ActivateEmailMfaButton = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const updateUser = useUpdateAccount({});

  const activate = async () => {
    await updateUser.mutateAsync({
      id: user?.id,
      userTypeProprietaryInfo: {
        mfa: {
          enabled: true,
          method: 'email',
        },
      },
    });
  };

  return (
    <Button colorScheme="gray" variant="outline" onClick={activate} isLoading={updateUser.isLoading}>
      {t('profile.activate')}
    </Button>
  );
};

export default ActivateEmailMfaButton;
