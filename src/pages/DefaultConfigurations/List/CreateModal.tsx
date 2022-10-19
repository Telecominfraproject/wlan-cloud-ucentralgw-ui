import * as React from 'react';
import { Box, SimpleGrid, useBoolean, useDisclosure, useToast } from '@chakra-ui/react';
import { AxiosError } from 'axios';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DefaultConfigurationSchema } from '../utils';
import { CreateButton } from 'components/Buttons/CreateButton';
import { EditButton } from 'components/Buttons/EditButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { StringField } from 'components/Form/Fields/StringField';
import MultiSelectField from 'components/Form/MultiSelectField';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { Modal } from 'components/Modals/Modal';
import { DefaultConfigurationResponse, useCreateDefaultConfig } from 'hooks/Network/DefaultConfigurations';
import { useGetDeviceTypes } from 'hooks/Network/Firmware';
import { useFormModal } from 'hooks/useFormModal';
import { useFormRef } from 'hooks/useFormRef';

const CreateDefaultConfigurationModal = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const modalProps = useDisclosure();
  const [isEditing, setIsEditing] = useBoolean();
  const createConfig = useCreateDefaultConfig();
  const getDeviceTypes = useGetDeviceTypes();
  const { form, formRef } = useFormRef();
  const { isConfirmOpen, closeConfirm, closeModal, closeCancelAndForm } = useFormModal({
    isDirty: form?.dirty,
    onModalClose: modalProps.onClose,
  });
  const [formKey, setFormKey] = React.useState(uuid());

  const isDisabled = !isEditing || createConfig.isLoading;

  React.useEffect(() => {
    setFormKey(uuid());
  }, [isEditing]);

  React.useEffect(() => {
    if (modalProps.isOpen) {
      setIsEditing.off();
    }
  }, [modalProps.isOpen]);
  return (
    <>
      <CreateButton onClick={modalProps.onOpen} mr={2} />
      <Modal
        {...modalProps}
        onClose={closeModal}
        title={`${t('common.create')} ${t('configurations.one')}`}
        topRightButtons={
          <>
            <SaveButton
              onClick={form.submitForm}
              isLoading={form.isSubmitting}
              isDisabled={!isEditing || !form.isValid}
            />
            <EditButton ml={2} isDisabled={isEditing} onClick={setIsEditing.toggle} isCompact />
          </>
        }
      >
        <Box>
          <Formik<DefaultConfigurationResponse>
            enableReinitialize
            innerRef={formRef as React.Ref<FormikProps<DefaultConfigurationResponse>>}
            initialValues={DefaultConfigurationSchema(t).cast()}
            key={formKey}
            validationSchema={DefaultConfigurationSchema(t)}
            onSubmit={(data, { setSubmitting, resetForm }) => {
              createConfig.mutateAsync(data, {
                onSuccess: () => {
                  toast({
                    id: `config-create-success`,
                    title: t('common.success'),
                    description: t('controller.configurations.create_success'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right',
                  });
                  setSubmitting(false);
                  resetForm();
                  modalProps.onClose();
                },
                onError: (error) => {
                  const e = error as AxiosError;
                  toast({
                    id: `config-create-error`,
                    title: t('common.error'),
                    description: e?.response?.data?.ErrorDescription,
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                    position: 'top-right',
                  });
                  setSubmitting(false);
                },
              });
            }}
          >
            <Box>
              <SimpleGrid spacing={4} minChildWidth="200px">
                <StringField name="name" label={t('common.name')} isRequired isDisabled={isDisabled} />
                <StringField name="description" label={t('common.description')} isDisabled={isDisabled} />
              </SimpleGrid>
              <MultiSelectField
                name="modelIds"
                label={t('controller.dashboard.device_types')}
                isDisabled={isDisabled}
                options={
                  getDeviceTypes.data?.deviceTypes.map((devType) => ({
                    label: devType,
                    value: devType,
                  })) ?? []
                }
                isRequired
              />
              <StringField name="configuration" label={t('configurations.one')} isArea isDisabled={isDisabled} />
            </Box>
          </Formik>
        </Box>
      </Modal>
      <ConfirmCloseAlertModal isOpen={isConfirmOpen} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export default CreateDefaultConfigurationModal;
