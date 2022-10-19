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
import { MagnifyingGlass, Trash } from 'phosphor-react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { v4 as uuid } from 'uuid';
import ActionsDropdown from './ActionsDropdown';
import { axiosSec } from 'constants/axiosInstances';

const deleteUserApi = async (userId) => axiosSec.delete(`/user/${userId}`).then(() => true);

const propTypes = {
  cell: PropTypes.shape({
    original: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      suspended: PropTypes.bool.isRequired,
      waitingForEmailCheck: PropTypes.bool.isRequired,
    }).isRequired,
  }).isRequired,
  refreshTable: PropTypes.func.isRequired,
  openEdit: PropTypes.func.isRequired,
};

const UserActions = ({ cell: { original: user }, refreshTable, openEdit }) => {
  const { t } = useTranslation();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteUser = useMutation(() => deleteUserApi(user.id), {
    onSuccess: () => {
      onClose();
      refreshTable();
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
      toast({
        id: 'user-delete-error',
        title: t('common.error'),
        description: t('crud.error_delete_obj', {
          obj: user.name,
          e: e?.response?.data?.ErrorDescription,
        }),
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right',
      });
    },
  });

  const handleDeleteClick = () => deleteUser.mutateAsync();
  const handleEditClick = () => openEdit(user.id);

  return (
    <Flex>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton colorScheme="red" icon={<Trash size={20} />} size="sm" />
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
                Cancel
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={deleteUser.isLoading}>
                Yes
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

UserActions.propTypes = propTypes;

export default UserActions;
