import * as React from 'react';
import { Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts/AuthProvider';
import { useUpdateAccount } from 'hooks/Network/Account';

const DeactivateMfaButton = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const updateUser = useUpdateAccount({});

  const deactivate = async () => {
    await updateUser.mutateAsync({
      id: user?.id,
      userTypeProprietaryInfo: {
        mfa: {
          enabled: false,
          method: '',
        },
      },
    });
  };

  return (
    <Button colorScheme="red" onClick={deactivate} isLoading={updateUser.isLoading}>
      {t('profile.deactivate')}
    </Button>
  );
};

export default DeactivateMfaButton;
