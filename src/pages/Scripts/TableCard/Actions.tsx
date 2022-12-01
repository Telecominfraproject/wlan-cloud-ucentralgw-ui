import * as React from 'react';
import {
  Box,
  Button,
  Center,
  HStack,
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
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { MagnifyingGlass, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Script, useDeleteScript } from 'hooks/Network/Scripts';

type Props = {
  script: Script;
  onSelect: (newId: string) => void;
};
const ScriptTableActions = ({ script, onSelect }: Props) => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteScript = useDeleteScript({ id: script.id });
  const { id } = useParams();

  const handleDeleteClick = React.useCallback(() => {
    deleteScript.mutate(script.id, {
      onSuccess: () => {
        onClose();
      },
    });
  }, []);
  const handleSelectClick = () => {
    onSelect(script.id);
  };

  return (
    <HStack mx="auto">
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label="delete-script" colorScheme="red" icon={<Trash size={20} />} size="sm" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent w="340px">
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('crud.delete')} {script.name}
          </PopoverHeader>
          <PopoverBody>
            <Text whiteSpace="break-spaces">{t('crud.delete_confirm', { obj: t('script.one') })}</Text>
          </PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteScript.isLoading}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleSelectClick}
          isDisabled={id === script.id}
        />
      </Tooltip>
    </HStack>
  );
};

export default ScriptTableActions;
