import React from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Alert, Button, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
  onSuccess: () => void;
}

const GoogleAuthenticatorActivationSuccess: React.FC<Props> = ({ onSuccess }) => {
  const { t } = useTranslation();

  const handleClick = () => onSuccess();

  return (
    <>
      <Alert colorScheme="green" my={4}>
        {t('account.google_authenticator_success_explanation')}
      </Alert>
      <Center>
        <Button mb={6} colorScheme="blue" onClick={handleClick} rightIcon={<ArrowRightIcon />}>
          {t('common.next')}
        </Button>
      </Center>
    </>
  );
};

export default GoogleAuthenticatorActivationSuccess;
