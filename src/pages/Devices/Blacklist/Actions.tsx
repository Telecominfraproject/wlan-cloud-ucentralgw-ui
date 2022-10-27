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
import { MagnifyingGlass, Pen, Trash } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BlacklistDevice, useDeleteBlacklistDevice } from 'hooks/Network/Blacklist';

interface Props {
  device: BlacklistDevice;
  refreshTable: () => void;
  onOpenEdit: (v: BlacklistDevice) => void;
}

const BlacklistDeviceActions = ({ device, refreshTable, onOpenEdit }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { mutateAsync: deleteDevice, isLoading: isDeleting } = useDeleteBlacklistDevice();

  const handleViewDetailsClick = () => navigate(`/devices/${device.serialNumber}`);
  const handleDeleteClick = () =>
    deleteDevice(device.serialNumber, {
      onSuccess: () => {
        refreshTable();
        toast({
          id: 'delete-blacklist-success',
          title: t('common.success'),
          description: t('controller.devices.delete_blacklist'),
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
      },
    });
  const handleOpenEdit = () => {
    onOpenEdit(device);
  };

  return (
    <Flex>
      <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <Tooltip hasArrow label={t('crud.delete')} placement="top" isDisabled={isOpen}>
          <Box>
            <PopoverTrigger>
              <IconButton aria-label="Open Device Delete" colorScheme="red" icon={<Trash size={20} />} size="sm" />
            </PopoverTrigger>
          </Box>
        </Tooltip>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            {t('crud.delete')} {device.serialNumber}
          </PopoverHeader>
          <PopoverBody>{t('crud.delete_confirm', { obj: t('devices.one') })}</PopoverBody>
          <PopoverFooter>
            <Center>
              <Button colorScheme="gray" mr="1" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button colorScheme="red" ml="1" onClick={handleDeleteClick} isLoading={isDeleting}>
                {t('common.yes')}
              </Button>
            </Center>
          </PopoverFooter>
        </PopoverContent>
      </Popover>
      <Tooltip hasArrow label={t('common.edit')} placement="top">
        <IconButton
          aria-label={t('common.edit')}
          ml={2}
          colorScheme="teal"
          icon={<Pen size={20} />}
          size="sm"
          onClick={handleOpenEdit}
        />
      </Tooltip>
      <Tooltip hasArrow label={t('common.view_details')} placement="top">
        <IconButton
          aria-label={t('common.view_details')}
          ml={2}
          colorScheme="blue"
          icon={<MagnifyingGlass size={20} />}
          size="sm"
          onClick={handleViewDetailsClick}
        />
      </Tooltip>
    </Flex>
  );
};

export default BlacklistDeviceActions;
