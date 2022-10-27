import React from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Button, Center, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface Props {
  setCurrentStep: (v: string) => void;
}

const GoogleAuthenticatorIntro: React.FC<Props> = ({ setCurrentStep }) => {
  const { t } = useTranslation();

  const handleClick = () => setCurrentStep('qr-code');

  return (
    <>
      <Text my={4}>
        <b>{t('account.google_authenticator_intro')}</b>
      </Text>
      <Text mb={4}>{t('account.google_authenticator_ready')}</Text>
      <Center>
        <Button mb={6} colorScheme="blue" onClick={handleClick} rightIcon={<ArrowRightIcon />}>
          {t('account.proceed_to_activation')}
        </Button>
      </Center>
    </>
  );
};

export default GoogleAuthenticatorIntro;
