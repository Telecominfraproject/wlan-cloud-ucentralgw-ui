import * as React from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Textarea,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Pencil } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { Secret, useUpdateSystemSecret } from 'hooks/Network/Secrets';
import { AxiosError } from 'models/Axios';

type FormValues = {
  key: string;
  value: string;
};

type Props = {
  secret: Secret;
};

const EditSecretButton = ({ secret }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [form, setForm] = React.useState<FormValues>({
    key: secret.key,
    value: secret.value,
  });
  const [isNameChanged, setIsNameChanged] = React.useState(false);
  const [isValueChanged, setIsValueChanged] = React.useState(false);
  const update = useUpdateSystemSecret();

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
    update.mutate(form, {
      onSuccess: () => {
        toast({
          id: 'create-system-secret-success',
          title: t('common.success'),
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
    setForm({
      key: secret.key,
      value: secret.value,
    });
    onOpen();
  };

  return (
    <Popover isOpen={isOpen} onOpen={handleOpenClick} onClose={onClose}>
      <Tooltip hasArrow label={t('crud.edit')} placement="top" isDisabled={isOpen}>
        <Box>
          <PopoverTrigger>
            <IconButton aria-label="delete-device" colorScheme="blue" icon={<Pencil size={20} />} size="sm" />
          </PopoverTrigger>
        </Box>
      </Tooltip>
      <PopoverContent w="340px">
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>
          {t('crud.edit')} {secret.key}
        </PopoverHeader>
        <PopoverBody>
          <Text whiteSpace="break-spaces">
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
          </Text>
        </PopoverBody>
        <PopoverFooter>
          <Center>
            <Button colorScheme="gray" mr="1" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" ml="1" onClick={onSubmit} isLoading={update.isLoading}>
              {t('common.save')}
            </Button>
          </Center>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default EditSecretButton;
