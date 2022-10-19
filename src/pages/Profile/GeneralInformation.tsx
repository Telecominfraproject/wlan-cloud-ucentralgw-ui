import * as React from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Center, Flex, Heading, Link, Spacer, Spinner, useToast } from '@chakra-ui/react';
import { Form, Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import * as Yup from 'yup';
import { SaveButton } from 'components/Buttons/SaveButton';
import { ToggleEditButton } from 'components/Buttons/ToggleEditButton';
import { Card } from 'components/Containers/Card';
import { CardBody } from 'components/Containers/Card/CardBody';
import { CardHeader } from 'components/Containers/Card/CardHeader';
import { StringField } from 'components/Form/Fields/StringField';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { useAuth } from 'contexts/AuthProvider';
import { testRegex } from 'helpers/formTests';
import { useUpdateAccount } from 'hooks/Network/Account';
import { useApiRequirements } from 'hooks/useApiRequirements';
import { useFormModal } from 'hooks/useFormModal';
import { useFormRef } from 'hooks/useFormRef';

const FormSchema = (t: (str: string) => string, { passRegex }: { passRegex: string }) =>
  Yup.object().shape({
    firstName: Yup.string().required(t('form.required')),
    lastName: Yup.string().required(t('form.required')),
    newPassword: Yup.string()
      .notRequired()
      .test('password', t('form.invalid_password'), (v) => testRegex(v, passRegex)),
    newPasswordConfirm: Yup.string()
      .notRequired()
      .test('password-confirm', t('form.invalid_password'), (v) => testRegex(v, passRegex))
      // @ts-ignore
      .test('password-match', 'Passwords must match', (value, { from }) => value === from[0].value.newPassword),
    description: Yup.string(),
  });

const GeneralInformationProfile = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { passwordPattern, passwordPolicyLink } = useApiRequirements();
  const { user } = useAuth();
  const updateUser = useUpdateAccount({});
  const { form, formRef } = useFormRef();
  const [formKey, setFormKey] = React.useState(uuid());
  const {
    isOpen: isEditing,
    isConfirmOpen,
    onOpen,
    closeConfirm,
    closeModal,
    closeCancelAndForm,
  } = useFormModal({
    isDirty: form?.dirty,
  });

  const toggleEditing = () => {
    if (!isEditing) {
      onOpen();
    } else {
      closeModal();
    }
  };

  React.useEffect(() => {
    setFormKey(uuid());
  }, [isEditing]);

  return (
    <Card p={4}>
      <CardHeader mb={2}>
        <Heading size="md">{t('profile.your_profile')}</Heading>
        <Spacer />
        <SaveButton
          onClick={form.submitForm}
          isLoading={form.isSubmitting}
          isDisabled={!form.isValid || !form.dirty}
          hidden={!isEditing}
        />
        <ToggleEditButton toggleEdit={toggleEditing} isEditing={isEditing} ml={2} />
      </CardHeader>
      <CardBody display="block">
        {!user ? (
          <Center>
            <Spinner size="lg" />
          </Center>
        ) : (
          <Formik<{
            description: string;
            firstName: string;
            lastName: string;
            newPassword?: string;
          }>
            key={formKey}
            initialValues={
              {
                email: user?.email,
                description: user?.description ?? '',
                firstName: user?.name.split(' ')[0] ?? '',
                lastName: user?.name.split(' ')[1] ?? '',
              } as {
                description: string;
                firstName: string;
                lastName: string;
                newPassword?: string;
              }
            }
            innerRef={
              formRef as React.Ref<
                FormikProps<{
                  description: string;
                  firstName: string;
                  lastName: string;
                  newPassword?: string;
                }>
              >
            }
            validationSchema={FormSchema(t, { passRegex: passwordPattern })}
            onSubmit={async ({ description, firstName, lastName, newPassword }, { setSubmitting }) => {
              await updateUser.mutateAsync(
                {
                  id: user?.id,
                  description,
                  name: `${firstName} ${lastName}`,
                  currentPassword: newPassword,
                },
                {
                  onSuccess: () => {
                    setSubmitting(false);
                    closeCancelAndForm();
                    toast({
                      id: 'account-update-success',
                      title: t('common.success'),
                      description: t('crud.success_update_obj', {
                        obj: t('profile.your_profile'),
                      }),
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                      position: 'top-right',
                    });
                  },
                },
              );
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <StringField name="email" label={t('common.email')} isDisabled />
                <Flex my={4}>
                  <StringField
                    name="firstName"
                    label={t('contacts.first_name')}
                    isDisabled={isSubmitting || !isEditing}
                    isRequired
                  />
                  <Box w={8} />
                  <StringField
                    name="lastName"
                    label={t('contacts.last_name')}
                    isDisabled={isSubmitting || !isEditing}
                    isRequired
                  />
                </Flex>
                <StringField
                  h="100px"
                  name="description"
                  label={t('profile.about_me')}
                  isDisabled={isSubmitting || !isEditing}
                  isArea
                />
                <Flex my={4}>
                  <StringField
                    name="newPassword"
                    label={t('profile.new_password')}
                    isDisabled={isSubmitting || !isEditing}
                    emptyIsUndefined
                    hideButton
                  />
                  <Box w={8} />
                  <StringField
                    name="newPasswordConfirm"
                    label={t('profile.new_password_confirmation')}
                    isDisabled={isSubmitting || !isEditing}
                    emptyIsUndefined
                    hideButton
                  />
                </Flex>
                <Box w="100%" mt={4} textAlign="right">
                  <Link href={passwordPolicyLink} isExternal>
                    {t('login.password_policy')}
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Box>
              </Form>
            )}
          </Formik>
        )}
      </CardBody>
      <ConfirmCloseAlertModal isOpen={isConfirmOpen} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </Card>
  );
};

export default GeneralInformationProfile;
