import React, { useEffect, useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Flex, Link, useToast, Tabs, TabList, TabPanels, TabPanel, Tab, SimpleGrid } from '@chakra-ui/react';
import axios from 'axios';
import { Formik, Form, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { NotesField } from '../../../../components/Form/Fields/NotesField';
import { SelectField } from '../../../../components/Form/Fields/SelectField';
import { StringField } from '../../../../components/Form/Fields/StringField';
import { useAuth } from 'contexts/AuthProvider';
import { testObjectName, testRegex } from 'helpers/formTests';
import { User, useUpdateUser } from 'hooks/Network/Users';
import { useApiRequirements } from 'hooks/useApiRequirements';

type Props = {
  editing: boolean;
  isOpen: boolean;
  onClose: () => void;
  selectedUser: User;
  formRef: React.Ref<FormikProps<User>>;
};

const UpdateUserForm = ({ editing, isOpen, onClose, selectedUser, formRef }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const [formKey, setFormKey] = useState(uuid());
  const { passwordPolicyLink, passwordPattern } = useApiRequirements();
  const updateUser = useUpdateUser();

  const UpdateUserSchema = () =>
    Yup.object().shape({
      name: Yup.string().required(t('form.required')).test('len', t('common.name_error'), testObjectName),
      currentPassword: Yup.string()
        .notRequired()
        .test('test-password', t('form.invalid_password'), (v) => testRegex(v, passwordPattern)),
      description: Yup.string(),
      mfa: Yup.string(),
      phoneNumber: Yup.string(),
    });

  const formIsDisabled = () => {
    if (!editing) return true;
    if (user?.userRole === 'root') return false;
    if (user?.userRole === 'partner') return false;
    if (user?.userRole === 'admin') {
      if (selectedUser.userRole === 'root' || selectedUser.userRole === 'partner' || selectedUser.userRole === 'admin')
        return true;
      return false;
    }
    return true;
  };

  const canEditRole = () => {
    if (selectedUser.userRole === 'root') return false;
    if (user?.userRole === 'root') return true;
    if (user?.userRole === 'admin' && selectedUser.userRole !== 'admin') return true;
    return false;
  };

  useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Formik
      innerRef={formRef}
      enableReinitialize
      key={formKey}
      initialValues={selectedUser}
      validationSchema={UpdateUserSchema}
      onSubmit={({ name, description, currentPassword, userRole, notes }, { setSubmitting, resetForm }) =>
        updateUser.mutateAsync(
          {
            id: selectedUser.id,
            name,
            currentPassword: currentPassword.length > 0 ? currentPassword : undefined,
            userRole,
            description,
            notes: notes.filter((note) => note.isNew),
          },
          {
            onSuccess: () => {
              setSubmitting(false);
              resetForm();
              toast({
                id: 'user-creation-success',
                title: t('common.success'),
                description: t('crud.success_update_obj', {
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
          },
        )
      }
    >
      <>
        <Tabs variant="enclosed">
          <TabList>
            <Tab>{t('common.main')}</Tab>
            <Tab>{t('common.notes')}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Form>
                <SimpleGrid minChildWidth="300px" spacing="20px">
                  <StringField name="email" label={t('common.email')} isDisabled isRequired />
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
                    isDisabled={!canEditRole() || formIsDisabled()}
                  />
                  <StringField name="name" label={t('common.name')} isDisabled={formIsDisabled()} isRequired />
                  <StringField
                    name="currentPassword"
                    label={t('user.password')}
                    isDisabled={formIsDisabled()}
                    hideButton
                  />
                  <StringField name="description" label={t('common.description')} isDisabled={formIsDisabled()} />
                </SimpleGrid>
              </Form>
            </TabPanel>
            <TabPanel>
              <NotesField isDisabled={!editing} />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Flex justifyContent="center" alignItems="right" maxW="100%" mt={4} mb={6}>
          <Box w="100%">
            <Link href={passwordPolicyLink} isExternal>
              {t('login.password_policy')}
              <ExternalLinkIcon mx="2px" />
            </Link>
          </Box>
        </Flex>
      </>
    </Formik>
  );
};

export default UpdateUserForm;
