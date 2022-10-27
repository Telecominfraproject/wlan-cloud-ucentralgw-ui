import React, { useMemo } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Alert,
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Switch,
  Text,
  useColorModeValue,
  Spacer,
  Link,
  SimpleGrid,
} from '@chakra-ui/react';
import { Formik, Field, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { StringField } from 'components/Form/Fields/StringField';
import { useAuth } from 'contexts/AuthProvider';
import { useLogin } from 'hooks/Network/Login';
import { useApiRequirements } from 'hooks/useApiRequirements';
import { AxiosError } from 'models/Axios';
import { FormFieldProps } from 'models/FormField';
import { LoginFormProps } from 'models/Login';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().required('Required'),
  rememberMe: Yup.bool(),
});

export interface _LoginFormProps {
  setActiveForm: React.Dispatch<React.SetStateAction<LoginFormProps>>;
}

const _LoginForm: React.FC<_LoginFormProps> = ({ setActiveForm }) => {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const { accessPolicyLink, passwordPolicyLink } = useApiRequirements();
  const titleColor = useColorModeValue('blue.300', 'white');
  const textColor = useColorModeValue('gray.400', 'white');
  const { mutateAsync: login, error } = useLogin();
  const forgotPassword = () => setActiveForm({ form: 'forgot-password' });

  const displayError = useMemo(() => {
    const loginError: AxiosError = error as AxiosError;

    if (loginError?.response?.data?.ErrorCode === 4) return t('login.waiting_for_email_verification');
    return t('login.invalid_credentials');
  }, [t, error]);

  return (
    <>
      <Heading color={titleColor} fontSize="32px" mb="10px">
        {t('login.welcome_back')}
      </Heading>
      <Text mb="24px" ms="4px" color={textColor} fontWeight="bold" fontSize="14px">
        {t('login.login_explanation')}
      </Text>
      <Formik
        initialValues={{
          email: '',
          password: '',
          rememberMe: false,
        }}
        validationSchema={LoginSchema}
        onSubmit={(values, { setSubmitting }) => {
          login(
            { userId: values.email, password: values.password },
            {
              onSuccess: (response) => {
                if (response.data.method && response.data.created) {
                  setActiveForm({
                    form: 'mfa',
                    data: {
                      method: response.data.method,
                      verifUuid: response.data.uuid,
                      userId: values.email,
                      password: values.password,
                      rememberMe: values.rememberMe,
                    },
                  });
                } else {
                  if (values.rememberMe) localStorage.setItem('access_token', response.data.access_token);
                  else sessionStorage.setItem('access_token', response.data.access_token);
                  setToken(response.data.access_token);
                }
              },
              onError: (e) => {
                const loginError: AxiosError = e as AxiosError;
                if (loginError?.response?.status === 403 && loginError.response.data.ErrorCode === 1) {
                  setActiveForm({
                    form: 'change-password',
                    data: { userId: values.email, password: values.password },
                  });
                }
                setSubmitting(false);
              },
            },
          );
        }}
      >
        {({ isSubmitting, isValid }) => (
          <Form>
            <SimpleGrid minChildWidth="240px" spacing={4}>
              <StringField name="email" label={t('common.email')} />
              <StringField name="password" label={t('common.password')} hideButton />
            </SimpleGrid>
            <Flex display={{ base: 'block', sm: 'flex' }} mt="24px">
              <Field name="rememberMe">
                {({ field }: { field: FormFieldProps }) => (
                  <FormControl display="flex" alignItems="center">
                    {/* @ts-ignore */}
                    <Switch {...field} colorScheme="blue" me="10px" />
                    <FormLabel htmlFor="remember-login" mb="0" ms="1" fontWeight="normal">
                      {t('login.remember_me')}
                    </FormLabel>
                  </FormControl>
                )}
              </Field>
              <Button
                colorScheme="gray"
                color={textColor}
                onClick={forgotPassword}
                fontWeight="medium"
                variant="ghost"
                pl={{ base: '0px' }}
              >
                {t('login.forgot_password')}
              </Button>
            </Flex>
            {error ? (
              <Alert mt="16px" status="error">
                {displayError}
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
              isLoading={isSubmitting}
              isDisabled={!isValid}
            >
              {t('login.sign_in')}
            </Button>
          </Form>
        )}
      </Formik>
      <Flex justifyContent="center" alignItems="center" maxW="100%" mt="0px">
        <Box w="100%">
          <Link href={passwordPolicyLink} isExternal textColor={textColor} mr="24px">
            {t('login.password_policy')}
            <ExternalLinkIcon mx="2px" />
          </Link>
          <Link href={accessPolicyLink} isExternal textColor={textColor}>
            {t('login.access_policy')}
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
        <Spacer />
      </Flex>
    </>
  );
};

export const LoginForm = _LoginForm;
