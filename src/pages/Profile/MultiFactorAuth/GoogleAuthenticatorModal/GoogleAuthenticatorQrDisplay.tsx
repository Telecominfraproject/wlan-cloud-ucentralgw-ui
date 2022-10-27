import React from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Button, Center, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import QrCodeDisplay from 'components/InformationDisplays/QrCodeDisplay';
import { useGetGoogleAuthenticatorQrCode } from 'hooks/Network/GoogleAuthenticator';

interface Props {
  setCurrentStep: (v: string) => void;
}

const GoogleAuthenticatorQrDisplay: React.FC<Props> = ({ setCurrentStep }) => {
  const { t } = useTranslation();
  const { data: qrSvg } = useGetGoogleAuthenticatorQrCode();

  const handleClick = () => setCurrentStep('tests');

  const split = () => {
    if (!qrSvg) return '';
    const v = qrSvg.split('path d="');
    if (v.length <= 1) return '';
    return v[1] ? v[1].split('" fill="#000000"')[0] : '';
  };

  return (
    <>
      <Text my={4}>
        <b>{t('account.google_authenticator_scan_qr_code_explanation')}</b>
      </Text>
      <Text mb={4}>{t('account.google_authenticator_scanned_qr_code')}</Text>
      {qrSvg && <QrCodeDisplay path={split() ?? ''} />}
      <Center>
        <Button my={6} colorScheme="blue" onClick={handleClick} rightIcon={<ArrowRightIcon />}>
          {t('common.next')}
        </Button>
      </Center>
    </>
  );
};

export default GoogleAuthenticatorQrDisplay;
