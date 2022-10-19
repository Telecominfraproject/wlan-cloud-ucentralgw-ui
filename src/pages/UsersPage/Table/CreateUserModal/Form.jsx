import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Flex, Link, useToast, SimpleGrid } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { testRegex } from 'helpers/formTests';
import { useAuth } from 'contexts/AuthProvider';
import { useApiRequirements } from 'hooks/useApiRequirements';
import { StringField } from 'components/Form/Fields/StringField';
import { SelectField } from 'components/Form/Fields/SelectField';
import { ToggleField } from 'components/Form/Fields/ToggleField';

const propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  createUser: PropTypes.instanceOf(Object).isRequired,
  refreshUsers: PropTypes.func.isRequired,
  formRef: PropTypes.instanceOf(Object).isRequired,
};

const CreateUserSchema = (t, { passRegex }) =>
  Yup.object().shape({
    email: Yup.string().email(t('form.invalid_email')).required('Required'),
    name: Yup.string().required('Required'),
    description: Yup.string(),
    currentPassword: Yup.string()
      .required(t('form.required'))
      .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passRegex))
      .default(''),
    note: Yup.string(),
    userRole: Yup.string(),
  });
const CreateUserNonRootSchema = (t, { passRegex }) =>
  Yup.object().shape({
    email: Yup.string().email(t('form.invalid_email')).required('Required'),
    name: Yup.string().required('Required'),
    description: Yup.string(),
    currentPassword: Yup.string()
      .required(t('form.required'))
      .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passRegex))
      .default(''),
    note: Yup.string(),
    userRole: Yup.string(),
  });

const CreateUserForm = ({ isOpen, onClose, createUser, refreshUsers, formRef }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const [formKey, setFormKey] = useState(uuid());
  const { passwordPolicyLink, passwordPattern } = useApiRequirements();

  const createParameters = ({
    name,
    description,
    email,
    currentPassword,
    note,
    userRole,
    emailValidation,
    changePassword,
  }) => {
    if (userRole === 'root') {
      return {
        name,
        email,
        currentPassword,
        userRole,
        description: description.length > 0 ? description : undefined,
        notes: note.length > 0 ? [{ note }] : undefined,
        emailValidation,
        changePassword,
      };
    }
    return {
      name,
      email,
      currentPassword,
      userRole,
      description: description.length > 0 ? description : undefined,
      notes: note.length > 0 ? [{ note }] : undefined,
      emailValidation,
      changePassword,
    };
  };

  useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Formik
      innerRef={formRef}
      key={formKey}
      initialValues={{
        name: '',
        description: '',
        email: '',
        currentPassword: '',
        note: '',
        userRole: user.userRole === 'admin' ? 'csr' : user.userRole,
        changePassword: true,
        emailValidation: true,
      }}
      validationSchema={
        user?.userRole === 'root'
          ? CreateUserSchema(t, { passRegex: passwordPattern })
          : CreateUserNonRootSchema(t, { passRegex: passwordPattern })
      }
      onSubmit={(formData, { setSubmitting, resetForm }) =>
        createUser.mutateAsync(createParameters(formData), {
          onSuccess: () => {
            setSubmitting(false);
            resetForm();
            toast({
              id: 'user-creation-success',
              title: t('common.success'),
              description: t('crud.success_create_obj', {
                obj: t('user.title'),
              }),
              status: 'success',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            refreshUsers();
            onClose();
          },
          onError: (e) => {
            toast({
              id: uuid(),
              title: t('common.error'),
              description: t('crud.error_create_obj', {
                obj: t('user.title'),
                e: e?.response?.data?.ErrorDescription,
              }),
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
            setSubmitting(false);
          },
        })
      }
    >
      {({ errors, touched }) => (
        <Form>
          <SimpleGrid minChildWidth="300px" spacing="20px">
            <StringField name="email" label={t('common.email')} errors={errors} touched={touched} isRequired />
            <StringField name="name" label={t('common.name')} errors={errors} touched={touched} isRequired />
            <SelectField
              name="userRole"
              label={t('user.role')}
              errors={errors}
              touched={touched}
              options={[
                { value: 'accounting', label: 'Accounting' },
                { value: 'admin', label: 'Admin' },
                { value: 'csr', label: 'CSR' },
                { value: 'installer', label: 'Installer' },
                { value: 'noc', label: 'NOC' },
                { value: 'root', label: 'Root' },
                { value: 'system', label: 'System' },
              ]}
              isRequired
            />
            <StringField
              name="currentPassword"
              label={t('user.password')}
              errors={errors}
              touched={touched}
              isRequired
              hideButton
            />
            <ToggleField name="changePassword" label={t('users.change_password')} errors={errors} touched={touched} />
            <ToggleField name="emailValidation" label={t('users.email_validation')} errors={errors} touched={touched} />
            <StringField name="description" label={t('common.description')} errors={errors} touched={touched} />
            <StringField name="note" label={t('common.note')} errors={errors} touched={touched} />
          </SimpleGrid>
          <Flex justifyContent="center" alignItems="center" maxW="100%" mt={4} mb={6}>
            <Box w="100%">
              <Link href={passwordPolicyLink} isExternal>
                {t('login.password_policy')}
                <ExternalLinkIcon mx="2px" />
              </Link>
            </Box>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

CreateUserForm.propTypes = propTypes;

export default CreateUserForm;
