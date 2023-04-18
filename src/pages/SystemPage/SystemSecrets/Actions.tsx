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
import { Eye, Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import EditSecretButton from './EditButton';
import { Secret, useDeleteSystemSecret } from 'hooks/Network/Secrets';

interface Props {
  secret: Secret;
  isDisabled?: boolean;
}

const SystemSecretActions = ({ secret, isDisabled }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteSecret = useDeleteSystemSecret();
  const { hasCopied, onCopy } = useClipboard(secret.value);

  const handleDeleteClick = React.useCallback(() => {
    deleteSecret.mutate(secret.key, {
      onSuccess: () => {
        onClose();
      },
    });
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
            {t('crud.delete')} {secret.key}
          </PopoverHeader>
          <PopoverBody>
            <Text whiteSpace="break-spaces">{t('crud.delete_confirm', { obj: t('system.secrets_one') })}</Text>
          </PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteSecret.isLoading}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip
        label={hasCopied ? `${t('common.copied')}!` : `${t('common.copy')} ${t('system.secrets_one')}`}
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
      <EditSecretButton secret={secret} />
      <Popover>
        <Tooltip label={`${t('common.view')} ${t('system.secrets_one')}`} hasArrow closeOnClick={false}>
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
            {t('common.view')} {secret.key}
            <Tooltip
              label={hasCopied ? `${t('common.copied')}!` : `${t('common.copy')} ${t('system.secrets_one')}`}
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
                <pre style={{ fontFamily: 'monospace' }}>{secret.value}</pre>
              </Center>
            </Text>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </HStack>
  );
};

export default SystemSecretActions;
