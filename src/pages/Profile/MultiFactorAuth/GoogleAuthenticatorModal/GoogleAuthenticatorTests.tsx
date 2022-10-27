import React, { useState } from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Alert, Button, Center, Heading, HStack, PinInput, PinInputField, Spinner, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useVerifyAuthenticator } from 'hooks/Network/GoogleAuthenticator';

interface Props {
  setCurrentStep: (v: string) => void;
}

const GoogleAuthenticatorTests: React.FC<Props> = ({ setCurrentStep }) => {
  const { t } = useTranslation();
  const [testIndex, setTestIndex] = useState(1);
  const [code, setCode] = useState('');
  const [previousCode, setPreviousCode] = useState('');
  const verifyCode = useVerifyAuthenticator();

  const submitCode = (fullCode: string) => {
    verifyCode.mutateAsync(
      {
        code: fullCode,
        index: testIndex,
      },
      {
        onSuccess: ({ data }) => {
          if (data.moreCodes) {
            setPreviousCode(fullCode);
            setCode('');
            setTestIndex(data.nextIndex);
          } else {
            setCurrentStep('activated');
          }
        },
        onError: () => {
          setCode('');
        },
      },
    );
  };

  return (
    <>
      <Heading size="md">
        {t('common.test')} #{testIndex}
      </Heading>
      <Text my={4}>
        <b>{t('account.google_authenticator_type_code')}</b>
      </Text>
      {testIndex > 1 && previousCode !== '' && (
        <Alert my={4} colorScheme="blue">
          {t('account.google_authenticator_wait_for_code', { old: previousCode })}
        </Alert>
      )}
      <Center>
        <HStack>
          <PinInput
            key={testIndex}
            isDisabled={verifyCode.isLoading}
            isInvalid={verifyCode.isError && code.length !== 6}
            value={code}
            onChange={(e) => setCode(e)}
            otp
            onComplete={submitCode}
            autoFocus
          >
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
      </Center>
      {verifyCode.isLoading && (
        <Center mt={6}>
          <Spinner size="md" />
        </Center>
      )}
      {verifyCode.isError ? (
        <Alert mt={6} status="error">
          {t('account.google_authenticator_wrong_code')}
        </Alert>
      ) : null}
      <Center>
        <Button
          my={6}
          colorScheme="blue"
          onClick={() => submitCode(code)}
          isDisabled={code.length !== 6}
          rightIcon={<ArrowRightIcon />}
        >
          {t('common.next')}
        </Button>
      </Center>
    </>
  );
};

export default GoogleAuthenticatorTests;
