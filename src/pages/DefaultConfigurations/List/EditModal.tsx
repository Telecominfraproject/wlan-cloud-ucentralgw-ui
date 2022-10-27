import * as React from 'react';
import { Box, SimpleGrid, useBoolean, UseDisclosureReturn, useToast } from '@chakra-ui/react';
import { Formik, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { DefaultConfigurationSchema } from '../utils';
import { EditButton } from 'components/Buttons/EditButton';
import { SaveButton } from 'components/Buttons/SaveButton';
import { StringField } from 'components/Form/Fields/StringField';
import MultiSelectField from 'components/Form/MultiSelectField';
import { ConfirmCloseAlertModal } from 'components/Modals/ConfirmCloseAlert';
import { Modal } from 'components/Modals/Modal';
import { DefaultConfigurationResponse, useUpdateDefaultConfig } from 'hooks/Network/DefaultConfigurations';
import { useGetDeviceTypes } from 'hooks/Network/Firmware';
import { useFormModal } from 'hooks/useFormModal';
import { useFormRef } from 'hooks/useFormRef';
import { AxiosError } from 'models/Axios';

type Props = {
  modalProps: UseDisclosureReturn;
  config?: DefaultConfigurationResponse;
};

const EditDefaultConfiguration = ({ modalProps, config }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [isEditing, setIsEditing] = useBoolean();
  const updateConfig = useUpdateDefaultConfig();
  const getDeviceTypes = useGetDeviceTypes();
  const { form, formRef } = useFormRef();
  const { isConfirmOpen, closeConfirm, closeModal, closeCancelAndForm } = useFormModal({
    isDirty: form?.dirty,
    onModalClose: modalProps.onClose,
  });
  const [formKey, setFormKey] = React.useState(uuid());

  const isDisabled = !isEditing || updateConfig.isLoading;

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
      <Modal
        {...modalProps}
        onClose={closeModal}
        title={`${t('common.edit')} ${t('configurations.one')}`}
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
          {config && (
            <Formik<DefaultConfigurationResponse>
              enableReinitialize
              innerRef={formRef as React.Ref<FormikProps<DefaultConfigurationResponse>>}
              initialValues={{
                ...config,
                configuration: JSON.stringify(config.configuration, null, 2),
              }}
              key={formKey}
              validationSchema={DefaultConfigurationSchema(t)}
              onSubmit={(data, { setSubmitting, resetForm }) => {
                updateConfig.mutateAsync(data, {
                  onSuccess: () => {
                    toast({
                      id: `config-edit-success`,
                      title: t('common.success'),
                      description: t('controller.configurations.update_success'),
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
                      id: `config-edit-error`,
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
          )}
        </Box>
      </Modal>
      <ConfirmCloseAlertModal isOpen={isConfirmOpen} confirm={closeCancelAndForm} cancel={closeConfirm} />
    </>
  );
};

export default EditDefaultConfiguration;
