import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Flex, Link, useToast, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import { Formik, Form, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { SelectField } from '../../../../components/Form/Fields/SelectField';
import { StringField } from '../../../../components/Form/Fields/StringField';
import { ToggleField } from '../../../../components/Form/Fields/ToggleField';
import { useAuth } from 'contexts/AuthProvider';
import { testRegex } from 'helpers/formTests';
import { useCreateUser } from 'hooks/Network/Users';
import { useApiRequirements } from 'hooks/useApiRequirements';

export type CreateUserFormValues = {
  name: string;
  description: string;
  email: string;
  currentPassword: string;
  note: string;
  userRole: string;
  emailValidation: boolean;
  changePassword: boolean;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  formRef: React.Ref<FormikProps<CreateUserFormValues>>;
};

const CreateUserForm = ({ isOpen, onClose, formRef }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const [formKey, setFormKey] = useState(uuid());
  const createUser = useCreateUser();
  const { passwordPolicyLink, passwordPattern } = useApiRequirements();

  const CreateUserSchema = Yup.object().shape({
    email: Yup.string().email(t('form.invalid_email')).required('Required'),
    name: Yup.string().required('Required'),
    description: Yup.string(),
    currentPassword: Yup.string()
      .required(t('form.required'))
      .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passwordPattern))
      .default(''),
    note: Yup.string(),
    userRole: Yup.string(),
  });
  const CreateUserNonRootSchema = Yup.object().shape({
    email: Yup.string().email(t('form.invalid_email')).required('Required'),
    name: Yup.string().required('Required'),
    description: Yup.string(),
    currentPassword: Yup.string()
      .required(t('form.required'))
      .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passwordPattern))
      .default(''),
    note: Yup.string(),
    userRole: Yup.string(),
  });

  const createParameters = ({
    name,
    description,
    email,
    currentPassword,
    note,
    userRole,
    emailValidation,
    changePassword,
  }: CreateUserFormValues) => {
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

  const defaultRole = () => {
    if (user?.userRole === 'admin') return 'csr';
    if (user) return user.userRole;
    return 'csr';
  };

  useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Formik
      innerRef={formRef}
      key={formKey}
      initialValues={
        {
          name: '',
          description: '',
          email: '',
          currentPassword: '',
          note: '',
          userRole: defaultRole(),
          changePassword: true,
          emailValidation: true,
        } as CreateUserFormValues
      }
      validationSchema={user?.userRole === 'root' ? CreateUserSchema : CreateUserNonRootSchema}
      onSubmit={(formData, { setSubmitting, resetForm }) =>
        createUser.mutate(createParameters(formData), {
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
            onClose();
          },
          onError: (e) => {
            setSubmitting(false);
            if (axios.isAxiosError(e))
              toast({
                id: uuid(),
                title: t('common.error'),
                description: e?.response?.data?.ErrorDescription,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'top-right',
              });
          },
        })
      }
    >
      <Form>
        <SimpleGrid minChildWidth="300px" spacing="20px">
          <StringField name="email" label={t('common.email')} isRequired />
          <StringField name="name" label={t('common.name')} isRequired />
          <SelectField
            name="userRole"
            label={t('user.role')}
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
          <StringField name="currentPassword" label={t('user.password')} isRequired hideButton />
          <ToggleField name="changePassword" label={t('users.change_password')} />
          <ToggleField name="emailValidation" label={t('users.email_validation')} />
          <StringField name="description" label={t('common.description')} />
          <StringField name="note" label={t('common.note')} />
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
    </Formik>
  );
};

export default CreateUserForm;
