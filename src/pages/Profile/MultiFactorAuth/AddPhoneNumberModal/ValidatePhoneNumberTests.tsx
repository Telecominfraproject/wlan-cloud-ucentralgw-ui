import React, { useEffect, useState } from 'react';
import { ArrowRightIcon } from '@chakra-ui/icons';
import { Alert, Button, Center, HStack, PinInput, PinInputField } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSendPhoneTest, useVerifyCode } from 'hooks/Network/Account';

const ValidatePhoneNumberTests: React.FC<{ phoneNumber: string; nextStep: () => void }> = ({
  phoneNumber,
  nextStep,
}) => {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const { mutateAsync: sendTest, isLoading: isSendingTest } = useSendPhoneTest();
  const {
    mutateAsync: verifyCode,
    isLoading: isVerifyingCode,
    isError: hadVerifyError,
  } = useVerifyCode({ phoneNumber });

  const onComplete = (fullCode: string) => {
    verifyCode(fullCode, {
      onSuccess: ({ data }) => {
        if (data.moreCodes) {
          setCode('');
        } else {
          nextStep();
        }
      },
      onError: () => {
        setCode('');
      },
    });
  };

  const handleSendClick = () => sendTest(phoneNumber);
  const handleSubmit = () => {
    onComplete(code);
  };

  useEffect(() => {
    if (phoneNumber.length > 0) sendTest(phoneNumber);
  }, [phoneNumber]);

  return (
    <>
      {t('account.verify_phone_instructions')}
      <Center>
        <HStack mt={4}>
          <PinInput otp onComplete={onComplete} autoFocus>
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
            <PinInputField />
          </PinInput>
        </HStack>
        <Button mt={4} ml={2} colorScheme="blue" isLoading={isSendingTest} onClick={handleSendClick}>
          {t('account.resend')}
        </Button>
      </Center>
      {hadVerifyError && (
        <Alert mt={6} status="error">
          {t('account.google_authenticator_wrong_code')}
        </Alert>
      )}
      <Center>
        <Button
          my={6}
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={code.length !== 6}
          isLoading={isVerifyingCode}
          rightIcon={<ArrowRightIcon />}
        >
          {t('common.next')}
        </Button>
      </Center>
    </>
  );
};

export default ValidatePhoneNumberTests;
