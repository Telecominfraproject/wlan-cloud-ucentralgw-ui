import React, { useEffect, useState } from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { Formik, Form, FormikProps } from 'formik';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import { SelectField } from '../../Form/Fields/SelectField';
import { ToggleField } from '../../Form/Fields/ToggleField';
import { ModalProps } from 'models/Modal';
import { WifiScanCommand } from 'models/Device';

const defaultValues: WifiScanCommand = {
  activeScan: false,
  dfs: true,
  bandwidth: '',
};
interface Props {
  modalProps: ModalProps;
  submit: (data: WifiScanCommand) => void;
  formRef: React.Ref<FormikProps<Record<string, unknown>>> | undefined;
}

const WifiScanForm: React.FC<Props> = ({ modalProps: { isOpen }, submit, formRef }) => {
  const { t } = useTranslation();
  const [formKey, setFormKey] = useState(uuid());

  useEffect(() => {
    setFormKey(uuid());
  }, [isOpen]);

  return (
    <Formik
      innerRef={formRef as React.Ref<FormikProps<WifiScanCommand>> | undefined}
      enableReinitialize
      key={formKey}
      initialValues={defaultValues}
      onSubmit={(data) => submit(data)}
    >
      <Form>
        <SimpleGrid minChildWidth="200px" spacing="10px" mb={4}>
          <ToggleField name="dfs" label={t('commands.override_dfs')} isRequired />
          <ToggleField name="activeScan" label={t('commands.active_scan')} isRequired />
          <SelectField
            name="bandwidth"
            label={t('analytics.bandwidth')}
            options={[
              { value: '', label: t('common.default') },
              { value: '20', label: '20 MHz' },
              { value: '40', label: '40 MHz' },
              { value: '80', label: '80 MHz' },
            ]}
            isRequired
          />
        </SimpleGrid>
      </Form>
    </Formik>
  );
};

export default WifiScanForm;
