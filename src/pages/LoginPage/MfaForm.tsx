import React, { useState } from 'react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import {
  Alert,
  Box,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Spacer,
  IconButton,
  Tooltip,
  Center,
  HStack,
  PinInput,
  PinInputField,
} from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'contexts/AuthProvider';
import { useSendPhoneCode, useSendVerifyCode } from 'hooks/Network/Login';
import { LoginFormProps } from 'models/Login';

export interface MfaFormProps {
  setActiveForm: React.Dispatch<React.SetStateAction<LoginFormProps>>;
  activeForm: LoginFormProps;
}

const _MfaForm: React.FC<MfaFormProps> = ({ activeForm, setActiveForm }) => {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const titleColor = useColorModeValue('blue.300', 'white');
  const textColor = useColorModeValue('gray.400', 'white');
  const verifyCode = useSendVerifyCode();
  const sendPhoneTest = useSendPhoneCode({ uuid: activeForm?.data?.verifUuid ?? '' });
  const [code, setCode] = useState('');

  const submitVerif = (answer: string) => {
    verifyCode.mutateAsync(
      {
        uuid: activeForm?.data?.verifUuid ?? '',
        answer,
      },
      {
        onSuccess: (response) => {
          if (activeForm?.data?.rememberMe) localStorage.setItem('access_token', response.data.access_token);
          else sessionStorage.setItem('access_token', response.data.access_token);
          setToken(response.data.access_token);
        },
        onError: (e) => {
          const error: AxiosError = e as AxiosError;
          if (error?.response?.status === 403 && error.response.data.ErrorCode === 1) {
            setActiveForm({
              form: 'change-password',
              data: { userId: activeForm?.data?.userId, password: activeForm?.data?.password },
            });
          }
        },
      },
    );
  };

  const handleResendClick = () => sendPhoneTest.mutateAsync();

  const getExplanation = () => {
    if (activeForm?.data?.method === 'sms') return t('login.sms_instructions');
    if (activeForm?.data?.method === 'email') return t('login.email_instructions');
    return t('login.google_instructions');
  };

  return (
    <>
      <Box display="flex" alignItems="center">
        <Heading color={titleColor} fontSize="32px" mb="10px">
          {t('login.verification')}
        </Heading>
        <Spacer />
        <Tooltip hasArrow label={t('common.go_back')} placement="top">
          <IconButton
            aria-label="Back to Login"
            size="lg"
            color="white"
            bg="blue.300"
            _hover={{
              bg: 'blue.500',
            }}
            _active={{
              bg: 'blue.300',
            }}
            icon={<ArrowBackIcon h={12} w={12} />}
            onClick={() => setActiveForm({ form: 'login' })}
          />
        </Tooltip>
      </Box>
      <Text mb="24px" ms="4px" mt={2} color={textColor} fontWeight="bold" fontSize="14px">
        {getExplanation()}
      </Text>
      <Center my={6}>
        <HStack>
          <PinInput
            isInvalid={verifyCode.isError && code.length === 6}
            onChange={(e) => setCode(e)}
            otp
            onComplete={submitVerif}
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
        {activeForm?.data?.method === 'authenticator' ? null : (
          <Button
            ml={2}
            onClick={handleResendClick}
            isLoading={sendPhoneTest.isLoading}
            loadingText={t('common.sending')}
          >
            {t('login.resend')}
          </Button>
        )}
      </Center>
      {verifyCode.isError ? (
        <Alert mt="16px" status="error">
          {t('login.invalid_mfa')}
        </Alert>
      ) : null}
      <Button
        fontSize="15px"
        type="submit"
        bg="blue.300"
        w="100%"
        h="45"
        mb="20px"
        color="white"
        mt="20px"
        _hover={{
          bg: 'blue.500',
        }}
        _active={{
          bg: 'blue.300',
        }}
        isLoading={verifyCode.isLoading}
        isDisabled={code.length < 6}
      >
        {t('login.sign_in')}
      </Button>
    </>
  );
};

export const MfaForm = _MfaForm;
