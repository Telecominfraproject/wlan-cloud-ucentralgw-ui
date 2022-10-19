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
import { StringField } from '../../components/Form/Fields/StringField';
import { LoginFormProps } from 'models/Login';
import { useApiRequirements } from 'hooks/useApiRequirements';
import { useForgotPassword } from 'hooks/Network/Login';

const ForgotPasswordSchema = Yup.object().shape({
  userId: Yup.string().email('Invalid email').required('Required'),
});

export interface ForgotPasswordFormProps {
  setActiveForm: React.Dispatch<React.SetStateAction<LoginFormProps>>;
}
const _ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setActiveForm }) => {
  const { t } = useTranslation();
  const { accessPolicyLink } = useApiRequirements();
  const titleColor = useColorModeValue('blue.300', 'white');
  const textColor = useColorModeValue('gray.400', 'white');
  const forgotPassword = useForgotPassword();

  return (
    <>
      <Box display="flex" alignItems="center">
        <Heading color={titleColor} fontSize="32px" mb="10px">
          {t('login.forgot_password_title')}
        </Heading>
        <Spacer />
        <Tooltip hasArrow label={t('common.go_back')} placement="top">
          <IconButton
            aria-label="Go back to login"
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
        {t('login.forgot_password_instructions')}
      </Text>
      <Formik
        initialValues={{
          userId: '',
        }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={({ userId }, { setSubmitting }) => {
          forgotPassword.mutateAsync(
            {
              userId,
            },
            {
              onSuccess: () => {
                setSubmitting(false);
              },
              onError: () => setSubmitting(false),
            },
          );
        }}
      >
        {({ isSubmitting, isValid, dirty }) => (
          <Form>
            <StringField name="userId" label={t('common.email')} />
            {forgotPassword.isSuccess ? (
              <Alert mt="16px" status="success">
                {t('login.forgot_password_successful')}
              </Alert>
            ) : null}
            {forgotPassword.error ? (
              <Alert mt="16px" status="error">
                {t('common.general_error')}
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
              {t('login.reset_password')}
            </Button>
          </Form>
        )}
      </Formik>
      <Flex justifyContent="center" alignItems="center" maxW="100%" mt="0px">
        <Box w="100%">
          <Link href={accessPolicyLink} isExternal textColor={textColor}>
            {t('login.access_policy')}
            <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
      </Flex>
    </>
  );
};

export const ForgotPasswordForm = _ForgotPasswordForm;
