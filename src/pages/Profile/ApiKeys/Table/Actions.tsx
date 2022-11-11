import React from 'react';
import { CopyIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Tooltip,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Center,
  Box,
  Button,
  useDisclosure,
  HStack,
  Text,
  useClipboard,
} from '@chakra-ui/react';
import { Eye, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { ApiKey, useDeleteApiKey } from 'hooks/Network/ApiKeys';

interface Props {
  apiKey: ApiKey;
  isDisabled?: boolean;
}

const ApiKeyActions = ({ apiKey, isDisabled }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteKey = useDeleteApiKey({ userId: apiKey.userUuid });
  const { hasCopied, onCopy } = useClipboard(apiKey.apiKey);

  const handleDeleteClick = React.useCallback(() => {
    deleteKey.mutate(
      { userId: apiKey.userUuid, keyId: apiKey.id },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  }, []);

  return (
    <HStack mx="auto">
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton
                aria-label="delete-device"
                colorScheme="red"
                icon={<Trash size={20} />}
                size="sm"
                isDisabled={isDisabled}
              />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent w="340px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('crud.delete')} {apiKey.name}
          </PopoverHeader>
          <PopoverBody>
            <Text whiteSpace="break-spaces">{t('crud.delete_confirm', { obj: t('keys.one') })}</Text>
          </PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteKey.isLoading}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip
        label={hasCopied ? `${t('common.copied')}!` : `${t('common.copy')} ${t('keys.one')}`}
        hasArrow
        closeOnClick={false}
      >
        <IconButton
          aria-label={t('common.copy')}
          icon={<CopyIcon h={5} w={5} />}
          onClick={onCopy}
          size="sm"
          colorScheme="teal"
          mr={2}
        />
      </Tooltip>
      <Popover>
        <Tooltip label={`${t('common.view')} ${t('keys.one')}`} hasArrow closeOnClick={false}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label={t('common.view')} icon={<Eye size={20} />} size="sm" colorScheme="purple" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent w="560px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('common.view')} {apiKey.name} {t('keys.one')}
            <Tooltip
              label={hasCopied ? `${t('common.copied')}!` : `${t('common.copy')} ${t('keys.one')}`}
              hasArrow
              closeOnClick={false}
            >
              <IconButton
                aria-label={t('common.copy')}
                icon={<CopyIcon h={4} w={4} />}
                onClick={onCopy}
                size="xs"
                colorScheme="teal"
                ml={2}
              />
            </Tooltip>
          </PopoverHeader>
          <PopoverBody>
            <Text whiteSpace="break-spaces">
              <Center>
                <pre style={{ fontFamily: 'monospace' }}>{apiKey.apiKey}</pre>
              </Center>
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </HStack>
  );
};

export default ApiKeyActions;
