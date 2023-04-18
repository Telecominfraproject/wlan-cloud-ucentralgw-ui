import React from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Tooltip,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { MagnifyingGlass, Trash } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import ActionsDropdown from './ActionsDropdown';
import { useDeleteUser, User } from 'hooks/Network/Users';

type Props = {
  user: User;
  openEdit: (user: User) => void;
  refreshTable: () => void;
};

const UserActions = ({ user, openEdit, refreshTable }: Props) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteUser = useDeleteUser();

  const handleDeleteClick = () =>
    deleteUser.mutate(user.id, {
      onSuccess: () => {
        onClose();
        toast({
          id: `user-delete-success${uuid()}`,
          title: t('common.success'),
          description: t('crud.success_delete_obj', {
            obj: user.name,
          }),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
      onError: (e) => {
        if (axios.isAxiosError(e))
          toast({
            id: 'user-delete-error',
            title: t('common.error'),
            description: e?.response?.data?.ErrorDescription,
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'top-right',
          });
      },
    });

  const handleEditClick = () => openEdit(user);

  return (
    <Flex>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label={t('crud.delete')} colorScheme="red" icon={<Trash size={20} />} size="sm" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Delete {user.name}</PopoverHeader>
          <PopoverBody>Are you sure you want to delete this user?</PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteUser.isLoading}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <ActionsDropdown
        id={user.id}
        isSuspended={user.suspended}
        isWaitingForCheck={user.waitingForEmailCheck}
        refresh={refreshTable}
      />
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleEditClick}
        />
      </Tooltip>
    </Flex>
  );
};

export default UserActions;
