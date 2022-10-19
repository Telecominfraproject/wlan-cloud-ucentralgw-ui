import React from 'react';
import { ArrowBackIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Alert,
  Box,
  Flex,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Spacer,
  Link,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { StringField } from 'components/Form/Fields/StringField';
import { useAuth } from 'contexts/AuthProvider';
import { testRegex } from 'helpers/formTests';
import { useChangePassword } from 'hooks/Network/Login';
import { useApiRequirements } from 'hooks/useApiRequirements';
import { LoginFormProps } from 'models/Login';

const LoginSchema = (t: (str: string) => string, { passRegex }: { passRegex: string }) =>
  Yup.object().shape({
    newPassword: Yup.string()
      .required()
      .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passRegex)),
    confirmNewPassword: Yup.string().oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
  });

export interface ChangePasswordFormProps {
  activeForm: LoginFormProps;
  setActiveForm: React.Dispatch<React.SetStateAction<LoginFormProps>>;
}

const _ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ activeForm, setActiveForm }) => {
  const { t } = useTranslation();
  const { setToken } = useAuth();
  const titleColor = useColorModeValue('blue.300', 'white');
  const { passwordPolicyLink, passwordPattern, accessPolicyLink } = useApiRequirements();
  const textColor = useColorModeValue('gray.400', 'white');
  const login = useChangePassword();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Heading color={titleColor} fontSize="32px" mb="10px">
          {t('login.change_your_password')}
        </Heading>
        <Spacer />
        <Tooltip hasArrow label={t('common.go_back')} placement="top">
          <IconButton
            aria-label="Back to Login Page"
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
      <Text mb="24px" ms="4px" color={textColor} fontWeight="bold" fontSize="14px">
        {t('login.change_password_explanation')}
      </Text>
      <Formik
        initialValues={{
          newPassword: '',
          confirmNewPassword: '',
        }}
        validationSchema={LoginSchema(t, { passRegex: passwordPattern })}
        onSubmit={(values, { setSubmitting }) => {
          login.mutateAsync(
            {
              userId: activeForm?.data?.userId ?? '',
              password: activeForm?.data?.password ?? '',
              newPassword: values.newPassword,
            },
            {
              onSuccess: (response: { data: { access_token: string } }) => {
                localStorage.setItem('access_token', response.data.access_token);
                setToken(response.data.access_token);
              },
              onError: () => setSubmitting(false),
            },
          );
        }}
      >
        {({ isSubmitting, isValid, dirty }) => (
          <Form>
            <StringField name="newPassword" label={t('login.new_password')} hideButton />
            <Box mt={2}>
              <StringField name="confirmNewPassword" label={t('login.confirm_new_password')} hideButton />
            </Box>
            {login.error ? (
              <Alert mt="16px" status="error">
                {t('login.change_password_error')}
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
              isDisabled={!isValid || !dirty}
            >
              {t('login.change_your_password')}
            </Button>
          </Form>
        )}
      </Formik>
      <Flex justifyContent="center" alignItems="center" maxW="100%" mt="0px">
        <Box w="100%">
          <Link href={passwordPolicyLink} isExternal textColor={textColor}>
            {t('login.password_policy')}
            <ExternalLinkIcon mx="2px" />
          </Link>
          <Link ml="24px" href={accessPolicyLink} isExternal textColor={textColor}>
            {t('login.access_policy')}
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
      </Flex>
    </>
  );
};

export const ChangePasswordForm = _ChangePasswordForm;
