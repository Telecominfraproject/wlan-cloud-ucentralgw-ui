import * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import ApiKeyExpiresOnField from './ExpiresOnField';
import { CreateButton } from 'components/Buttons/CreateButton';
import { Modal } from 'components/Modals/Modal';
import { ApiKey, useCreateApiKey } from 'hooks/Network/ApiKeys';

type Props = {
  apiKeys: ApiKey[];
  userId: string;
  isDisabled?: boolean;
};

const thirtyDaysFromNow = () => Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;

const CreateApiKeyButton = ({ apiKeys, userId, isDisabled }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [expiresOn, setExpiresOn] = React.useState(thirtyDaysFromNow());
  const createKey = useCreateApiKey({ userId });

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value);

  const onCreate = React.useCallback(() => {
    createKey.mutate(
      { data: { name, description, userUuid: userId, expiresOn }, userId },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (e) => {
          if (axios.isAxiosError(e)) {
            toast({
              id: 'create-api-key-error',
              title: t('common.error'),
              description: e?.response?.data?.ErrorDescription,
              status: 'error',
              duration: 5000,
              isClosable: true,
              position: 'top-right',
            });
          }
        },
      },
    );
  }, [name, description, expiresOn]);

  const nameError = React.useMemo(() => {
    if (
      name.length === 0 ||
      name.length > 20 ||
      apiKeys.map(({ name: n }) => n).includes(name) ||
      !/^[a-z0-9]+$/i.test(name)
    ) {
      return t('keys.name_error');
    }
    return undefined;
  }, [name, apiKeys]);

  const handleOpenClick = () => {
    setName('');
    setDescription('');
    setExpiresOn(thirtyDaysFromNow());
    onOpen();
  };

  return (
    <>
      {apiKeys.length >= 10 && (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>{t('keys.max_keys')}</AlertDescription>
        </Alert>
      )}
      <CreateButton onClick={handleOpenClick} isDisabled={isDisabled || apiKeys.length >= 10} isCompact />
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={` ${t('crud.create')} ${t('keys.one')}`}
        topRightButtons={
          <Button
            colorScheme="blue"
            ml="1"
            onClick={onCreate}
            isDisabled={nameError !== undefined || description.length > 64}
          >
            {t('common.save')}
          </Button>
        }
        options={{
          modalSize: 'sm',
        }}
      >
        <Box>
          <FormControl mb={2} isInvalid={nameError !== undefined}>
            <FormLabel>{t('common.name')}</FormLabel>
            <Input value={name} onChange={onNameChange} />
            <FormErrorMessage>{nameError}</FormErrorMessage>
          </FormControl>
          <FormControl mb={2} isInvalid={description.length > 64}>
            <FormLabel>{t('common.description')}</FormLabel>
            <Textarea value={description} onChange={onDescriptionChange} noOfLines={2} />
            <FormErrorMessage>{t('keys.description_error')}</FormErrorMessage>
          </FormControl>
          <ApiKeyExpiresOnField value={expiresOn} setValue={setExpiresOn} />
        </Box>
      </Modal>
    </>
  );
};

export default CreateApiKeyButton;
