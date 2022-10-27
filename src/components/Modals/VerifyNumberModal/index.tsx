import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Center,
  HStack,
  PinInput,
  PinInputField,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useSendPhoneTest, useVerifyCode } from 'hooks/Network/Account';

export interface VerifyNumberModalProps {
  isOpen: boolean;
  cancel: () => void;
  setValidated: (e: boolean) => void;
  phoneNumber: string;
}

const _VerifyNumberModal: React.FC<VerifyNumberModalProps> = ({ isOpen, cancel, phoneNumber, setValidated }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const sendPhoneTest = useSendPhoneTest();
  const testCode = useVerifyCode({ phoneNumber });

  const handleSendClick = () => sendPhoneTest.mutateAsync(phoneNumber);
  const onPinComplete = (code: string) =>
    testCode.mutateAsync(code, {
      onSuccess: () => {
        setValidated(true);
        cancel();
        toast({
          id: 'verif-phone-success',
          title: t('common.success'),
          description: t('account.success_phone_verif'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: () => {
        toast({
          id: 'verif-phone-error',
          title: t('common.error'),
          description: t('account.error_phone_verif'),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });

  useEffect(() => {
    if (isOpen && phoneNumber.length > 0) sendPhoneTest.mutateAsync(phoneNumber);
  }, [phoneNumber, isOpen]);

  return (
    <AlertDialog isOpen={isOpen} leastDestructiveRef={undefined} onClose={() => {}} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{t('account.verify_phone_number')}</AlertDialogHeader>
          <AlertDialogBody>
            {t('account.verify_phone_instructions')}
            <Center>
              <HStack mt={4}>
                <PinInput otp onComplete={onPinComplete} autoFocus>
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                  <PinInputField />
                </PinInput>
              </HStack>
            </Center>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={cancel} mr={4}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" isLoading={sendPhoneTest.isLoading} onClick={handleSendClick}>
              {t('account.resend')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export const VerifyNumberModal = _VerifyNumberModal;
