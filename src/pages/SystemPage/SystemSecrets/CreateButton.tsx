import * as React from 'react';
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { CreateButton } from '../../../components/Buttons/CreateButton';
import { SaveButton } from '../../../components/Buttons/SaveButton';
import { Modal } from '../../../components/Modals/Modal';
import { useCreateSystemSecret } from 'hooks/Network/Secrets';
import { AxiosError } from 'models/Axios';

type FormValues = {
  key: string;
  value: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  key: '',
  value: '',
};

const SystemSecretCreateButton = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = React.useState<FormValues>(DEFAULT_FORM_VALUES);
  const [isNameChanged, setIsNameChanged] = React.useState(false);
  const [isValueChanged, setIsValueChanged] = React.useState(false);
  const create = useCreateSystemSecret();

  const onKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, key: e.target.value });
    if (!isNameChanged) setIsNameChanged(true);
  };
  const onValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, value: e.target.value });
    if (!isValueChanged) setIsValueChanged(true);
  };

  const isNameError = form.key.length === 0;
  const isValueError = form.value.length === 0;

  const onSubmit = () => {
    create.mutate(form, {
      onSuccess: () => {
        toast({
          id: 'create-system-secret-success',
          title: t('common.success'),
          description: t('crud.success_update_obj', {
            obj: t('system.secrets_one'),
          }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        onClose();
      },
      onError: (e) => {
        toast({
          id: 'create-system-secret-error',
          title: t('common.error'),
          description: (e as AxiosError)?.response?.data?.ErrorDescription,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  };

  const handleOpenClick = () => {
    setIsNameChanged(false);
    setIsValueChanged(false);
    setForm(DEFAULT_FORM_VALUES);
    onOpen();
  };

  return (
    <>
      <CreateButton onClick={handleOpenClick} isCompact />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t('system.secrets_create')}
        topRightButtons={
          <SaveButton onClick={onSubmit} isDisabled={isNameError || isValueError} isLoading={create.isLoading} />
        }
        options={{
          modalSize: 'sm',
        }}
      >
        <Box>
          <FormControl mb={2} isInvalid={isNameError && isNameChanged}>
            <FormLabel>{t('common.name')}</FormLabel>
            <Input value={form.key} onChange={onKeyChange} />
            <FormErrorMessage>{t('form.required')}</FormErrorMessage>
          </FormControl>
          <FormControl mb={2} isInvalid={isValueError && isValueChanged}>
            <FormLabel>{t('common.value')}</FormLabel>
            <Textarea value={form.value} onChange={onValueChange} rows={2} />
            <FormErrorMessage>{t('form.required')}</FormErrorMessage>
          </FormControl>
        </Box>
      </Modal>
    </>
  );
};

export default SystemSecretCreateButton;
