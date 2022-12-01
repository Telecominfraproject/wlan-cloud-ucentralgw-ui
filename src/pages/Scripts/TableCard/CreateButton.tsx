import * as React from 'react';
import { Box, Flex, SimpleGrid, useDisclosure, useToast } from '@chakra-ui/react';
import axios from 'axios';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import RolesInput from './RolesInput';
import ScriptFileInput from './ScripFile';
import ScriptUploadField from './UploadField';
import { CreateButton } from 'components/Buttons/CreateButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { NumberField } from 'components/Form/Fields/NumberField';
import { SelectField } from 'components/Form/Fields/SelectField';
import { StringField } from 'components/Form/Fields/StringField';
import { ToggleField } from 'components/Form/Fields/ToggleField';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { Modal } from 'components/Modals/Modal';
import { useAuth } from 'contexts/AuthProvider';
import { Script, useCreateScript } from 'hooks/Network/Scripts';
import { useFormModal } from 'hooks/useFormModal';
import { useFormRef } from 'hooks/useFormRef';

export const ScriptSchema = (t: (str: string) => string, defaultAuthor?: string) =>
  Yup.object()
    .shape({
      name: Yup.string().required(t('form.required')),
      description: Yup.string(),
      deferred: Yup.boolean().required(t('form.required')),
      author: Yup.string().required(t('form.required')),
      type: Yup.string().required(t('form.required')),
      content: Yup.string().required(t('form.required')),
      timeout: Yup.number().when('deferred', {
        is: false,
        then: Yup.number()
          .required(t('form.required'))
          .moreThan(10)
          .lessThan(5 * 60), // 5 mins
      }),
      version: Yup.string().min(1, t('form.required')).max(15, '15 chars. limit').required(t('form.required')),
      uri: Yup.string(),
      defaultUploadDestination: Yup.string(),
    })
    .default({
      name: '',
      description: '',
      content: '',
      author: defaultAuthor,
      deferred: false,
      timeout: 30,
      type: 'shell',
      version: '1.0.0',
      restricted: ['root'],
    });

type Props = {
  onIdSelect: (newId: string) => void;
};

const CreateScriptButton = ({ onIdSelect }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { user } = useAuth();
  const modalProps = useDisclosure();
  const create = useCreateScript();
  const { form, formRef } = useFormRef();
  const { isConfirmOpen, closeConfirm, closeModal, closeCancelAndForm } = useFormModal({
    isDirty: form?.dirty,
    onModalClose: modalProps.onClose,
  });

  const isDisabled = false;

  return (
    <>
      <CreateButton onClick={modalProps.onOpen} isCompact />
      <Modal
        {...modalProps}
        onClose={closeModal}
        title={t('crud.create_object', { obj: t('script.one') })}
        topRightButtons={
          <SaveButton onClick={form.submitForm} isLoading={form.isSubmitting} isDisabled={!form.isValid} />
        }
      >
        <Box>
          <Formik<Script>
            enableReinitialize
            innerRef={formRef as React.Ref<FormikProps<Script>>}
            initialValues={ScriptSchema(t, user?.email).cast()}
            validationSchema={ScriptSchema(t, user?.email)}
            onSubmit={(data, { setSubmitting, resetForm }) => {
              create.mutateAsync(
                { ...data, author: user?.email },
                {
                  onSuccess: (response) => {
                    toast({
                      id: `script-create-success`,
                      title: t('common.success'),
                      description: t('script.create_success'),
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                      position: 'top-right',
                    });
                    setSubmitting(false);
                    resetForm();
                    modalProps.onClose();
                    onIdSelect(response.id);
                  },
                  onError: (e) => {
                    setSubmitting(false);
                    if (axios.isAxiosError(e))
                      toast({
                        id: `script-create-error`,
                        title: t('common.error'),
                        description: e?.response?.data?.ErrorDescription,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                        position: 'top-right',
                      });
                  },
                },
              );
            }}
          >
            {(props: { setFieldValue: (k: string, v: unknown) => void; values: Script }) => (
              <Box>
                <SimpleGrid spacing={4} minChildWidth="200px">
                  <StringField name="name" label={t('common.name')} isRequired isDisabled={isDisabled} />
                  <StringField name="description" label={t('common.description')} isDisabled={isDisabled} />
                </SimpleGrid>
                <Box mt={2} maxW="460px">
                  <StringField name="uri" label={t('script.helper')} isDisabled={isDisabled} />
                </Box>
                <Flex mt={2}>
                  <Box w="120px" mr={2} mb={4}>
                    <ToggleField
                      name="deferred"
                      label={t('script.deferred')}
                      onChangeCallback={(v) => {
                        if (v) {
                          props.setFieldValue('timeout', undefined);
                        } else {
                          props.setFieldValue('timeout', 30);
                        }
                      }}
                      isDisabled={isDisabled}
                    />
                  </Box>
                  <Box>
                    {!props.values.deferred && (
                      <NumberField
                        name="timeout"
                        label={t('script.timeout')}
                        isDisabled={isDisabled}
                        unit="s"
                        isRequired
                        w="100px"
                      />
                    )}
                  </Box>
                </Flex>
                <Box mt={2}>
                  <RolesInput name="restricted" label={t('script.restricted')} isDisabled={isDisabled} />
                </Box>
                <Box mt={2}>
                  <ScriptUploadField name="defaultUploadURI" isDisabled={isDisabled} />
                </Box>
                <Flex mt={2}>
                  <Box w="120px">
                    <SelectField
                      name="type"
                      label={t('common.type')}
                      options={[
                        { value: 'shell', label: 'Shell' },
                        { value: 'bundle', label: 'Bundle' },
                      ]}
                      isRequired
                      isDisabled={isDisabled}
                      w="120px"
                    />
                  </Box>
                  <Box mx={2}>
                    <StringField
                      name="version"
                      label={t('footer.version')}
                      isRequired
                      isDisabled={isDisabled}
                      w="160px"
                    />
                  </Box>
                  <StringField name="author" label={t('script.author')} isRequired isDisabled={isDisabled} />
                </Flex>
                <Box mt={2}>
                  <ScriptFileInput isDisabled={isDisabled} />
                </Box>
              </Box>
            )}
          </Formik>
        </Box>
      </Modal>
      <ConfirmCloseAlertModal isOpen={isConfirmOpen} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export default CreateScriptButton;
