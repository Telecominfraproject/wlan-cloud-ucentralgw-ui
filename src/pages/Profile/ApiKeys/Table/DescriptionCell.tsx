import * as React from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
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
import axios from 'axios';
import { Pen } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { ApiKey, useUpdateApiKey } from 'hooks/Network/ApiKeys';

type Props = {
  apiKey: ApiKey;
};

const ApiKeyDescriptionCell = ({ apiKey }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const [newDescription, setNewDescription] = React.useState(apiKey.description);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const updateApiKey = useUpdateApiKey({ userId: apiKey.userUuid });

  const onDescriptionChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewDescription(e.target.value);
  }, []);

  const handleSaveClick = () => {
    updateApiKey.mutate(
      {
        userId: apiKey.userUuid,
        keyId: apiKey.id,
        description: newDescription,
      },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (e) => {
          if (axios.isAxiosError(e)) {
            toast({
              id: 'error-save-api-key-description',
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
  };

  const onCancel = () => {
    setNewDescription(apiKey.description);
    onClose();
  };

  return (
    <Text w="100%" overflowWrap="break-word" whiteSpace="pre-wrap">
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip label={t('common.edit')} hasArrow closeOnClick={false} isDisabled={isOpen}>
          <Box display="unset">
            <PopoverTrigger>
              <IconButton aria-label={t('common.edit')} icon={<Pen size={20} />} size="xs" colorScheme="teal" mr={2} />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent w="340px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('common.edit')} {apiKey.name} {t('common.description')}
          </PopoverHeader>
          <PopoverBody>
            <FormControl mb={2} isInvalid={newDescription.length > 64}>
              <FormLabel>{t('common.description')}</FormLabel>
              <Textarea value={newDescription} onChange={onDescriptionChange} noOfLines={2} />
              <FormErrorMessage>{t('keys.description_error')}</FormErrorMessage>
            </FormControl>
          </PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onCancel}>
                {t('common.cancel')}
              </Button>
              <Button
                colorScheme="blue"
                ml="1"
                onClick={handleSaveClick}
                isDisabled={newDescription.length > 64}
                isLoading={updateApiKey.isLoading}
              >
                {t('common.save')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      {apiKey.description}
    </Text>
  );
};

export default ApiKeyDescriptionCell;
